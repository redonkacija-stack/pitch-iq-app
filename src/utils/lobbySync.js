/**
 * PitchIQ Lobby Synchronization Utility
 * Supports cross-tab BroadcastChannel, window storage events, and
 * lightweight peer messaging for room code state sync.
 */

const STORAGE_PREFIX = "pitchiq:match-rooms:v2";

export function readAllRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRoom(room) {
  if (!room || !room.code) return;
  const rooms = readAllRooms();
  rooms[room.code] = {
    ...room,
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
  const clean = code.toUpperCase().replace(/\s+/g, "");
  const rooms = readAllRooms();
  return rooms[clean] || null;
}

export function generateRoomCode() {
  // Format e.g. PITCH-9X or 6-char formatted code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i += 1) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PITCH-${randomPart}`;
}

export class LobbySyncEngine {
  constructor(roomCode, onUpdate) {
    this.roomCode = roomCode ? roomCode.toUpperCase().replace(/\s+/g, "") : null;
    this.onUpdate = onUpdate;
    this.channel = null;
    this.storageListener = null;

    if (this.roomCode) {
      this.init();
    }
  }

  init() {
    if (typeof window === "undefined") return;

    if ("BroadcastChannel" in window && this.roomCode) {
      try {
        this.channel = new BroadcastChannel(`pitchiq-sync:${this.roomCode}`);
        this.channel.onmessage = (event) => {
          if (event.data?.type === "ROOM_STATE_SYNC" && event.data.room?.code === this.roomCode) {
            this.onUpdate?.(event.data.room);
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel initialization warning:", err);
      }
    }

    this.storageListener = (event) => {
      if (event.key === STORAGE_PREFIX && this.roomCode) {
        const latest = getRoom(this.roomCode);
        if (latest) {
          this.onUpdate?.(latest);
        }
      }
    };
    window.addEventListener("storage", this.storageListener);
  }

  broadcast(room) {
    if (!room || !room.code) return;
    saveRoom(room);
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: "ROOM_STATE_SYNC",
          room,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn("Failed to broadcast message:", err);
      }
    }
  }

  destroy() {
    if (this.channel) {
      try {
        this.channel.close();
      } catch {}
      this.channel = null;
    }
    if (this.storageListener) {
      window.removeEventListener("storage", this.storageListener);
      this.storageListener = null;
    }
  }
}
