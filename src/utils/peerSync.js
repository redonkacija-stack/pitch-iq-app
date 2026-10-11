import Peer from "peerjs";

const STORAGE_PREFIX = "pitchiq:match-rooms:v4";

/**
 * Normalizes user input room codes:
 * Reduce room input to its four character code. Spaces and punctuation are ignored.
 * Older IQ-XXXX links remain accepted.
 */
export function normalizeRoomCode(input) {
  if (!input) return "";
  const raw = String(input).toUpperCase().trim();
  const clean = raw.replace(/[^A-Z0-9]/g, "");
  if (!clean) return "";
  const hasLegacyPrefix = /^(?:IQ|PITCH)[\s-]+/i.test(raw);
  const legacy = hasLegacyPrefix
    ? clean.startsWith("PITCH")
      ? clean.slice(5)
      : clean.slice(2)
    : clean;
  return legacy.slice(0, 4);
}

/**
 * Generates a four-character room code (for example 7B2M).
 * Excludes ambiguous characters (0, O, 1, I).
 */
export function generateRoomCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 4; i += 1) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomPart;
}

export function cleanCodeKey(code) {
  return normalizeRoomCode(code).replace(/[^A-Z0-9]/g, "").toLowerCase();
}

export function readAllRooms() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRoom(room) {
  if (!room || !room.code || typeof window === "undefined") return;
  const normalized = normalizeRoomCode(room.code);
  const rooms = readAllRooms();
  rooms[normalized] = {
    ...room,
    code: normalized,
    lastUpdated: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_PREFIX, JSON.stringify(rooms));
  } catch (error) {
    console.warn("Storage write failed:", error);
  }
}

export function getRoom(code) {
  if (!code) return null;
  const normalized = normalizeRoomCode(code);
  const rooms = readAllRooms();
  return rooms[normalized] || null;
}

export function getShareableRoomUrl(roomCode) {
  if (typeof window === "undefined") return "";
  const normalized = normalizeRoomCode(roomCode);
  return `${window.location.origin}${window.location.pathname}?room=${normalized}`;
}

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
    ],
  },
};

/**
 * Robust Peer-to-Peer Synchronization Engine
 * Connects cross-device via WebRTC with PeerJS, plus instant local BroadcastChannel fallback.
 */
export class PeerSyncEngine {
  constructor({
    roomCode,
    isHost = false,
    nickname = "Player",
    onStateChange,
    onStatusChange,
    onGameStart,
    onGameAction,
  }) {
    this.roomCode = normalizeRoomCode(roomCode);
    this.codeKey = cleanCodeKey(this.roomCode);
    this.isHost = isHost;
    this.nickname = nickname.trim() || (isHost ? "Host" : "Challenger");
    this.onStateChange = onStateChange;
    this.onStatusChange = onStatusChange;
    this.onGameStart = onGameStart;
    this.onGameAction = onGameAction;

    this.peer = null;
    this.connections = new Map(); // peerId -> DataConnection (host side)
    this.hostConnection = null; // DataConnection (guest side)
    this.currentRoom = null;
    this.localSlot = isHost ? 0 : null;
    this.destroyed = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.channel = null;
    this.storageListener = null;

    this.init();
  }

  init() {
    if (typeof window === "undefined") return;

    // 1. Initialize local BroadcastChannel & storage fallback for instant same-browser multi-tab sync
    this.initLocalSync();

    // 2. Initialize PeerJS WebRTC connection
    this.initPeerJS();
  }

  initLocalSync() {
    if ("BroadcastChannel" in window && this.codeKey) {
      try {
        this.channel = new BroadcastChannel(`pitchiq-channel:${this.codeKey}`);
        this.channel.onmessage = (event) => {
          const { type, room, slotId, action, config } = event.data || {};
          if (type === "ROOM_STATE" && room) {
            this.handleIncomingRoomState(room, slotId);
          } else if (type === "START_MATCH" && config) {
            this.onGameStart?.(config);
          } else if (type === "GAME_ACTION" && action) {
            this.onGameAction?.(action);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel fallback initialization error:", e);
      }
    }

    this.storageListener = (event) => {
      if (event.key === STORAGE_PREFIX && this.roomCode) {
        const latest = getRoom(this.roomCode);
        if (latest) {
          this.handleIncomingRoomState(latest, this.localSlot);
        }
      }
    };
    window.addEventListener("storage", this.storageListener);
  }

  initPeerJS() {
    const hostPeerId = `pitchiq-room-${this.codeKey}`;
    const guestPeerId = `pitchiq-guest-${this.codeKey}-${Math.random().toString(36).substring(2, 7)}`;
    const myId = this.isHost ? hostPeerId : guestPeerId;

    try {
      this.peer = new Peer(myId, PEER_CONFIG);

      this.peer.on("open", (id) => {
        if (this.destroyed) return;
        if (this.isHost) {
          this.onStatusChange?.("hosting", "Hosting Room. Waiting for players...");
        } else {
          this.onStatusChange?.("connecting", "Connecting to Room...");
          this.connectToHost(hostPeerId);
        }
      });

      this.peer.on("connection", (conn) => {
        if (this.destroyed || !this.isHost) return;
        this.handleHostIncomingConnection(conn);
      });

      this.peer.on("error", (err) => {
        if (this.destroyed) return;
        console.warn("PeerJS error:", err?.type || err);

        if (err.type === "unavailable-id") {
          if (this.isHost) {
            // Another host exists or previous session hasn't released ID on broker
            this.onStatusChange?.("hosting", "Room active. Reconnecting...");
          }
        } else if (err.type === "peer-unavailable") {
          this.handleGuestConnectionFailure();
        } else {
          if (!this.isHost && this.retryCount >= this.maxRetries) {
            this.onStatusChange?.("error", "Invalid Room Code or Host Disconnected");
          }
        }
      });

      this.peer.on("disconnected", () => {
        if (!this.destroyed && this.peer) {
          this.peer.reconnect();
        }
      });
    } catch (err) {
      console.warn("PeerJS creation failed, running on local sync:", err);
      if (!this.isHost) {
        this.checkLocalFallback();
      }
    }
  }

  // HOST: Handle incoming guest connection
  handleHostIncomingConnection(conn) {
    this.connections.set(conn.peer, conn);

    conn.on("open", () => {
      // Send current room state immediately upon opening
      if (this.currentRoom) {
        conn.send({
          type: "ROOM_STATE",
          room: this.currentRoom,
        });
      }
    });

    conn.on("data", (data) => {
      if (!data || typeof data !== "object") return;

      if (data.type === "JOIN_REQUEST") {
        this.handleGuestJoinRequest(conn, data);
      } else if (data.type === "CLAIM_SLOT") {
        this.handleGuestClaimSlot(conn, data);
      } else if (data.type === "GAME_ACTION") {
        this.broadcastAction(data.action, conn.peer);
        this.onGameAction?.(data.action);
      }
    });

    conn.on("close", () => {
      this.connections.delete(conn.peer);
      this.handleGuestDisconnect(conn.peer);
    });

    conn.on("error", () => {
      this.connections.delete(conn.peer);
      this.handleGuestDisconnect(conn.peer);
    });
  }

  handleGuestJoinRequest(conn, data) {
    if (!this.currentRoom) return;

    const guestName = data.nickname?.trim() || "Challenger";
    const openSlot = this.currentRoom.slots.find((s) => !s.occupied);

    if (!openSlot) {
      conn.send({
        type: "ROOM_FULL",
        message: "Room is already full.",
      });
      return;
    }

    const updatedSlots = this.currentRoom.slots.map((s) =>
      s.id === openSlot.id
        ? {
            ...s,
            name: guestName,
            occupied: true,
            isBot: false,
            peerId: conn.peer,
          }
        : s,
    );

    const updatedRoom = {
      ...this.currentRoom,
      slots: updatedSlots,
      lastUpdated: Date.now(),
    };

    this.currentRoom = updatedRoom;
    saveRoom(updatedRoom);

    // Notify guest of their assigned slot
    conn.send({
      type: "ASSIGNED_SLOT",
      slotId: openSlot.id,
      room: updatedRoom,
    });

    // Broadcast updated state to all connected peers
    this.broadcastRoomState(updatedRoom);
    this.onStateChange?.(updatedRoom, 0);
  }

  handleGuestClaimSlot(conn, data) {
    if (!this.currentRoom) return;
    const { targetSlotId, nickname } = data;

    const updatedSlots = this.currentRoom.slots.map((s) => {
      if (s.peerId === conn.peer && s.id !== targetSlotId) {
        return {
          ...s,
          name: `Open Slot (${s.role})`,
          occupied: false,
          isBot: false,
          peerId: undefined,
        };
      }
      if (s.id === targetSlotId && !s.host) {
        return {
          ...s,
          name: nickname || s.name,
          occupied: true,
          isBot: false,
          peerId: conn.peer,
        };
      }
      return s;
    });

    const updatedRoom = {
      ...this.currentRoom,
      slots: updatedSlots,
      lastUpdated: Date.now(),
    };

    this.currentRoom = updatedRoom;
    saveRoom(updatedRoom);
    this.broadcastRoomState(updatedRoom);
    this.onStateChange?.(updatedRoom, 0);
  }

  handleGuestDisconnect(peerId) {
    if (!this.currentRoom) return;

    let changed = false;
    const updatedSlots = this.currentRoom.slots.map((s) => {
      if (s.peerId === peerId) {
        changed = true;
        return {
          ...s,
          name: `Open Slot (${s.role})`,
          occupied: false,
          isBot: false,
          peerId: undefined,
        };
      }
      return s;
    });

    if (changed) {
      const updatedRoom = {
        ...this.currentRoom,
        slots: updatedSlots,
        lastUpdated: Date.now(),
      };
      this.currentRoom = updatedRoom;
      saveRoom(updatedRoom);
      this.broadcastRoomState(updatedRoom);
      this.onStateChange?.(updatedRoom, 0);
    }
  }

  // GUEST: Connect to Host
  connectToHost(hostPeerId) {
    if (this.destroyed || !this.peer) return;

    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;

      const connectTimeout = setTimeout(() => {
        if (!conn.open && !this.destroyed) {
          this.handleGuestConnectionFailure();
        }
      }, 6000);

      conn.on("open", () => {
        clearTimeout(connectTimeout);
        this.onStatusChange?.("connected", `Connected to Room ${this.roomCode}. Waiting for host...`);

        // Send Join Request with Nickname
        conn.send({
          type: "JOIN_REQUEST",
          nickname: this.nickname,
        });
      });

      conn.on("data", (data) => {
        if (!data || typeof data !== "object") return;

        if (data.type === "ASSIGNED_SLOT") {
          this.localSlot = data.slotId;
          this.currentRoom = data.room;
          this.onStatusChange?.("connected", `Connected to Room ${this.roomCode}`);
          this.onStateChange?.(data.room, data.slotId);
        } else if (data.type === "ROOM_STATE") {
          this.handleIncomingRoomState(data.room, this.localSlot);
        } else if (data.type === "ROOM_FULL") {
          this.onStatusChange?.("error", data.message || "Room is already full.");
        } else if (data.type === "START_MATCH") {
          this.onGameStart?.(data.config || data.room);
        } else if (data.type === "GAME_ACTION") {
          this.onGameAction?.(data.action);
        }
      });

      conn.on("close", () => {
        this.handleGuestConnectionFailure();
      });

      conn.on("error", () => {
        this.handleGuestConnectionFailure();
      });
    } catch {
      this.handleGuestConnectionFailure();
    }
  }

  handleGuestConnectionFailure() {
    if (this.destroyed) return;

    if (this.retryCount < this.maxRetries) {
      this.retryCount += 1;
      this.onStatusChange?.(
        "connecting",
        `Connecting to Room... (Attempt ${this.retryCount + 1}/${this.maxRetries + 1})`,
      );
      setTimeout(() => {
        if (!this.destroyed) {
          this.connectToHost(`pitchiq-room-${this.codeKey}`);
        }
      }, 1500 * this.retryCount);
    } else {
      // Check local storage fallback before showing error
      this.checkLocalFallback();
    }
  }

  checkLocalFallback() {
    const localFound = getRoom(this.roomCode);
    if (localFound) {
      this.onStatusChange?.("connected", "Connected via Local Sync! Waiting for host...");
      this.handleIncomingRoomState(localFound, this.localSlot);
    } else {
      this.onStatusChange?.("error", "Invalid Room Code or Host Disconnected");
    }
  }

  handleIncomingRoomState(room, preferredSlot) {
    if (!room || room.code !== this.roomCode) return;

    this.currentRoom = room;
    let slot = preferredSlot;

    if (slot === null || slot === undefined) {
      // Try to identify our slot by nickname or peer ID
      const matched = room.slots.find(
        (s) =>
          (this.peer && s.peerId === this.peer.id) ||
          s.name === this.nickname,
      );
      if (matched) {
        slot = matched.id;
      }
    }

    this.localSlot = slot;
    this.onStateChange?.(room, slot);
  }

  // BROADCAST METHODS
  updateRoom(newRoom) {
    this.currentRoom = newRoom;
    saveRoom(newRoom);
    this.broadcastRoomState(newRoom);
  }

  broadcastRoomState(room) {
    if (!room) return;
    this.currentRoom = room;
    saveRoom(room);

    // 1. Send via PeerJS to all connected peers
    if (this.isHost) {
      for (const conn of this.connections.values()) {
        if (conn.open) {
          conn.send({ type: "ROOM_STATE", room });
        }
      }
    } else if (this.hostConnection?.open) {
      this.hostConnection.send({ type: "ROOM_STATE", room });
    }

    // 2. Broadcast via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: "ROOM_STATE",
          room,
          slotId: this.localSlot,
        });
      } catch {}
    }
  }

  claimSlot(slotId) {
    if (this.isHost) {
      // Host claims directly
      if (!this.currentRoom) return;
      const updatedSlots = this.currentRoom.slots.map((s) => {
        if (s.id === this.localSlot && s.id !== slotId) {
          return {
            ...s,
            name: `Open Slot (${s.role})`,
            occupied: false,
            host: false,
          };
        }
        if (s.id === slotId) {
          return {
            ...s,
            name: this.nickname,
            occupied: true,
            host: true,
          };
        }
        return s;
      });
      const updatedRoom = { ...this.currentRoom, slots: updatedSlots };
      this.updateRoom(updatedRoom);
      this.localSlot = slotId;
      this.onStateChange?.(updatedRoom, slotId);
    } else if (this.hostConnection?.open) {
      // Guest sends claim request to host
      this.hostConnection.send({
        type: "CLAIM_SLOT",
        targetSlotId: slotId,
        nickname: this.nickname,
      });
    }
  }

  broadcastStartGame(gameConfig) {
    const config = gameConfig || this.currentRoom;

    if (this.isHost) {
      for (const conn of this.connections.values()) {
        if (conn.open) {
          conn.send({
            type: "START_MATCH",
            config,
            room: this.currentRoom,
          });
        }
      }
    }

    if (this.channel) {
      try {
        this.channel.postMessage({
          type: "START_MATCH",
          config,
          room: this.currentRoom,
        });
      } catch {}
    }
  }

  broadcastAction(action, excludePeerId = null) {
    if (!action) return;

    if (this.isHost) {
      for (const [peerId, conn] of this.connections.entries()) {
        if (peerId !== excludePeerId && conn.open) {
          conn.send({ type: "GAME_ACTION", action });
        }
      }
    } else if (this.hostConnection?.open) {
      this.hostConnection.send({ type: "GAME_ACTION", action });
    }

    if (this.channel) {
      try {
        this.channel.postMessage({ type: "GAME_ACTION", action });
      } catch {}
    }
  }

  destroy() {
    this.destroyed = true;

    // Close all host connections
    for (const conn of this.connections.values()) {
      try {
        conn.close();
      } catch {}
    }
    this.connections.clear();

    // Close guest connection
    if (this.hostConnection) {
      try {
        this.hostConnection.close();
      } catch {}
      this.hostConnection = null;
    }

    // Destroy peer
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }

    // Close BroadcastChannel
    if (this.channel) {
      try {
        this.channel.close();
      } catch {}
      this.channel = null;
    }

    // Remove window listener
    if (this.storageListener) {
      window.removeEventListener("storage", this.storageListener);
      this.storageListener = null;
    }
  }
}

