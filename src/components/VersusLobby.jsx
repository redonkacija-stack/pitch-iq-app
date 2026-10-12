import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Crosshair,
  Gamepad2,
  Grid3X3,
  Link as LinkIcon,
  Link2,
  Loader2,
  Radio,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { matchModes } from "../data/gameModes";
import {
  generateRoomCode,
  getRoom,
  getShareableRoomUrl,
  normalizeRoomCode,
  PeerSyncEngine,
  saveRoom,
} from "../utils/peerSync";

const modeIcons = { Shield, Link2, Crosshair, TrendingUp, Grid3X3, Search, Zap, Users, Swords };
const leagueLabels = {
  PL: "Premier League",
  LL: "La Liga",
  SA: "Serie A",
  BL: "Bundesliga",
  L1: "Ligue 1",
};
const difficultyStyles = {
  Easy: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  Hard: "border-rose-400/25 bg-rose-400/10 text-rose-300",
};

export default function VersusLobby({ onBack, onStart, initialRoom = null, syncEngine = null }) {
  const [format, setFormat] = useState(initialRoom?.format || "1v1");
  const [selectedMode, setSelectedMode] = useState(
    initialRoom?.mode || "invasion",
  );
  const [difficulty, setDifficulty] = useState("Top 5 European Leagues");
  const [timer, setTimer] = useState("Standard · 30 sec");
  const [nickname, setNickname] = useState(() => {
    try {
      return localStorage.getItem("pitchiq:player-nickname") || "Player";
    } catch {
      return "Player";
    }
  });
  const [joinInput, setJoinInput] = useState("");
  const [room, setRoom] = useState(initialRoom);
  const [localSlot, setLocalSlot] = useState(initialRoom?.localSlot ?? 0);
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle | connecting | connected | hosting | error
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const syncRef = useRef(syncEngine);
  const handedOffRef = useRef(false);

  const capacity = format === "2v2" ? 4 : 2;

  // Save nickname preference
  function handleNicknameChange(e) {
    const val = e.target.value;
    setNickname(val);
    try {
      localStorage.setItem("pitchiq:player-nickname", val);
    } catch {}
  }

  // Handle URL query parameter ?room=XXXX on load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam && !room) {
      const normalized = normalizeRoomCode(roomParam);
      setJoinInput(normalized);
      // Auto-connect if direct link opened
      attemptJoin(normalized);
    }
  }, []);

  // Cleanup sync engine on unmount
  useEffect(() => {
    return () => {
      if (handedOffRef.current) return;
      syncRef.current?.destroy();
      syncRef.current = null;
    };
  }, []);

  function createSlots(hostName, currentFormat) {
    if (currentFormat === "2v2") {
      return [
        {
          id: 0,
          slotNumber: 1,
          team: "A",
          role: "Host",
          name: hostName,
          occupied: true,
          host: true,
          isBot: false,
        },
        {
          id: 1,
          slotNumber: 2,
          team: "A",
          role: "Partner",
          name: "Open Slot (Partner)",
          occupied: false,
          host: false,
          isBot: false,
        },
        {
          id: 2,
          slotNumber: 3,
          team: "B",
          role: "Opponent 1",
          name: "Open Slot (Opponent 1)",
          occupied: false,
          host: false,
          isBot: false,
        },
        {
          id: 3,
          slotNumber: 4,
          team: "B",
          role: "Opponent 2",
          name: "Open Slot (Opponent 2)",
          occupied: false,
          host: false,
          isBot: false,
        },
      ];
    }
    return [
      {
        id: 0,
        slotNumber: 1,
        team: "A",
        role: "Host",
        name: hostName,
        occupied: true,
        host: true,
        isBot: false,
      },
      {
        id: 1,
        slotNumber: 2,
        team: "B",
        role: "Opponent",
        name: "Open Slot (Opponent)",
        occupied: false,
        host: false,
        isBot: false,
      },
    ];
  }

  function handleCreateRoom() {
    syncRef.current?.destroy();

    const code = generateRoomCode();
    const hostName = nickname.trim() || "Host (You)";
    const slots = createSlots(hostName, format);

    const newRoom = {
      code,
      format,
      capacity,
      mode: selectedMode,
      difficulty,
      timer,
      slots,
      status: "lobby",
      teamScores: { A: 0, B: 0 },
      teamGuessed: { A: 0, B: 0 },
      createdAt: new Date().toISOString(),
    };

    setRoom(newRoom);
    setLocalSlot(0);
    setConnectionStatus("connecting");
    setStatusMessage("Registering room with the connection service...");
    saveRoom(newRoom);

    // Initialize PeerJS Host
    syncRef.current = new PeerSyncEngine({
      roomCode: code,
      isHost: true,
      nickname: hostName,
      onStateChange: (updatedRoom) => {
        setRoom(updatedRoom);
      },
      onStatusChange: (status, msg) => {
        setConnectionStatus(status);
        setStatusMessage(msg);
      },
      onGameAction: () => {},
    });

    syncRef.current.currentRoom = newRoom;
  }

  function attemptJoin(codeToJoin) {
    const cleanCode = normalizeRoomCode(codeToJoin);
    if (cleanCode.length !== 4) {
      setConnectionStatus("error");
      setStatusMessage("Please enter a 4-character room code (e.g. 4819)");
      return;
    }

    syncRef.current?.destroy();

    setConnectionStatus("connecting");
    setStatusMessage(`Connecting to Room ${cleanCode}...`);

    const guestName = nickname.trim() || "Challenger";

    // Initialize PeerJS Guest connection
    syncRef.current = new PeerSyncEngine({
      roomCode: cleanCode,
      isHost: false,
      nickname: guestName,
      onStateChange: (updatedRoom, assignedSlot) => {
        setRoom(updatedRoom);
        if (assignedSlot !== null && assignedSlot !== undefined) {
          setLocalSlot(assignedSlot);
        }
      },
      onStatusChange: (status, msg) => {
        setConnectionStatus(status);
        setStatusMessage(msg);
      },
      onGameStart: (launchedRoom) => {
        handedOffRef.current = true;
        onStart?.({ ...launchedRoom, localSlot: syncRef.current?.localSlot ?? launchedRoom.localSlot }, syncRef.current);
      },
      onGameAction: () => {},
    });
  }

  function handleJoinSubmit(e) {
    e?.preventDefault();
    attemptJoin(joinInput);
  }

  function claimSlot(slotId) {
    if (!room || !syncRef.current) return;
    syncRef.current.claimSlot(slotId);
    setLocalSlot(slotId);
  }

  function fillRemainingWithBots() {
    if (!room || localSlot !== 0) return;
    const botNames = ["TacticsIQ Bot", "Scout Alpha", "Strikeforce AI"];
    let botIndex = 0;

    const updatedSlots = room.slots.map((s) => {
      if (!s.occupied) {
        const name = botNames[botIndex % botNames.length];
        botIndex += 1;
        const difficulty = ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)];
        return {
          ...s,
          name: `${name} (${s.role})`,
          occupied: true,
          isBot: true,
          botDifficulty: difficulty,
        };
      }
      return s;
    });

    const updatedRoom = { ...room, slots: updatedSlots };
    setRoom(updatedRoom);
    syncRef.current?.updateRoom(updatedRoom);
    setStatusMessage("Bot Joined · open seats filled with AI players");
    setConnectionStatus("hosting");
  }

  async function handleCopyCode() {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  }

  async function handleCopyLink() {
    if (!room?.code) return;
    try {
      const url = getShareableRoomUrl(room.code);
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  }

  function handleLaunchMatch() {
    if (!room) return;
    const isHost = localSlot === 0;
    if (!isHost) return;

    // Ensure all empty slots are labeled
    const finalizedSlots = room.slots.map((s) => ({
      ...s,
      occupied: true,
      name: s.occupied ? s.name : `Guest (${s.role})`,
    }));

    const launchedRoom = {
      ...room,
      slots: finalizedSlots,
      localSlot,
      activePlayerId: room.slots.find((slot) => slot.host)?.id ?? 0,
      turnDeadline: Date.now() + 15000,
      status: "in-game",
    };

    saveRoom(launchedRoom);
    syncRef.current?.broadcastStartGame(launchedRoom);
    handedOffRef.current = true;
    onStart?.(launchedRoom, syncRef.current);
  }

  const isHost = localSlot === 0;

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-7 px-4 py-7 sm:px-7 lg:px-9">
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime">
              <Swords size={13} /> Versus Arena
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold text-sky-300">
              <Radio size={12} className="animate-pulse text-sky-400" />
              PeerJS WebRTC Cross-Device Sync
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            1v1 & 2v2 Versus Room Code System
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            Create or join a synchronized room. Compete live across different
            phones, tablets, and computers with real-time peer-to-peer data sync.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        {/* Left Column: Room Settings & Parameter Controls */}
        <section className="space-y-6 rounded-2xl border border-white/10 glass-surface p-6 sm:p-8">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <Gamepad2 size={18} className="text-lime" /> Room Settings & Game
              Parameters
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Select match format, category pool, and round timer.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Format Selection (1v1 vs 2v2) */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Match Format
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("1v1")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                    format === "1v1"
                      ? "border-lime bg-lime/10 text-lime"
                      : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <Users size={18} className="mb-1" />
                  <span className="text-xs font-bold">1v1 Head-to-Head</span>
                  <span className="text-[10px] text-slate-400">
                    Host vs Opponent
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("2v2")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                    format === "2v2"
                      ? "border-lime bg-lime/10 text-lime"
                      : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <Shield size={18} className="mb-1" />
                  <span className="text-xs font-bold">2v2 Co-Op Squads</span>
                  <span className="text-[10px] text-slate-400">
                    Team A vs Team B
                  </span>
                </button>
              </div>
            </div>

            {/* Nickname / Display Name */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Player Tag
              </label>
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                maxLength={20}
                placeholder="Enter player nickname..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-lime/50"
              />
            </div>

            {/* Game Mode Selection */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Choose a Game Mode
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="group" aria-label="Game modes">
                {matchModes.map((m) => (
                  (() => {
                    const ModeIcon = modeIcons[m.iconUrl?.replace("lucide:", "")] || Gamepad2;
                    const isSelected = selectedMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedMode(m.id)}
                        className={`group relative flex min-h-[190px] flex-col rounded-2xl border p-4 text-left backdrop-blur transition-all duration-300 active:scale-[.98] ${
                          isSelected
                            ? "border-emerald-400/80 bg-emerald-500/[.09] shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                            : "border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        }`}
                      >
                        <div className="flex w-full items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${isSelected ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-slate-700 bg-slate-950/70 text-slate-300 group-hover:text-emerald-300"}`}>
                              <ModeIcon size={21} strokeWidth={1.8} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold uppercase tracking-wide text-white">{m.label}</p>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">{m.badge}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="shrink-0 text-emerald-300" size={19} aria-label="Selected" />}
                        </div>
                        <p className="mt-4 flex-1 text-xs leading-relaxed text-slate-300">{m.detail}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${difficultyStyles[m.difficulty] || difficultyStyles.Medium}`}>{m.difficulty}</span>
                          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-300">{m.duration}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 border-t border-white/[.06] pt-3" aria-label="Top five European leagues">
                          {m.leagueMarks?.map((mark) => (
                            <span key={mark} title={leagueLabels[mark]} aria-label={leagueLabels[mark]} className="inline-flex h-6 min-w-7 items-center justify-center rounded-md border border-slate-700/80 bg-slate-950/70 px-1.5 text-[8px] font-black tracking-tight text-slate-300">{mark}</span>
                          ))}
                          <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-slate-500">{m.category}</span>
                        </div>
                      </button>
                    );
                  })()
                ))}
              </div>
            </div>

            {/* Pool Difficulty */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Player Pool
              </label>
              <div className="mt-2 grid gap-2" role="group" aria-label="Player pool">
                {[
                  { label: "Top 5 European Leagues", detail: "Premier League, La Liga, Serie A, Bundesliga, Ligue 1" },
                  { label: "All Leagues (Worldwide)", detail: "Clubs and players from across the global game" },
                  { label: "UCL Champions & International Giants", detail: "Elite European clubs and national teams" },
                ].map((poolOption) => {
                  const isSelected = difficulty === poolOption.label;
                  return (
                    <button
                      key={poolOption.label}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setDifficulty(poolOption.label)}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all active:scale-[.99] ${
                        isSelected
                          ? "border-emerald-400/70 bg-emerald-500/[.08] text-white shadow-[0_0_14px_rgba(16,185,129,0.12)]"
                          : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-emerald-500/40"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-bold">{poolOption.label}</span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{poolOption.detail}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="shrink-0 text-emerald-300" size={17} aria-label="Selected" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timer Clock */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Question Clock / Speed
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  "Relaxed · 45 sec",
                  "Standard · 30 sec",
                  "Blitz · 15 sec",
                  "Untimed · Casual",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimer(t)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      timer === t
                        ? "border-lime bg-lime/10 text-lime"
                        : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button
              onClick={handleCreateRoom}
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-bold text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90 active:scale-95"
            >
              <Sparkles size={16} /> Create Room & Generate Code
            </button>
            {room && isHost && (
              <button
                onClick={handleLaunchMatch}
                className="inline-flex items-center gap-2 rounded-xl border border-lime/40 bg-lime/10 px-5 py-3 text-sm font-bold text-lime transition hover:bg-lime/20 active:scale-95"
              >
                <Gamepad2 size={16} /> Launch Match for All Players{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Join Room Form & Live Slots */}
        <aside className="space-y-6">
          {/* Join Existing Room Card */}
          <div className="rounded-2xl border border-white/10 glass-surface p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <UserPlus size={16} className="text-lime" /> Join Existing Room
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Enter your friend’s four-character code or open their invite link.
            </p>

            <form onSubmit={handleJoinSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(normalizeRoomCode(e.target.value))}
                placeholder="e.g. 4819 or 7B2M"
                maxLength={12}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-sm tracking-widest text-lime placeholder-slate-600 outline-none focus:border-lime/50 uppercase"
              />
              <button
                type="submit"
                disabled={connectionStatus === "connecting"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
              >
                {connectionStatus === "connecting" ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-lime" />{" "}
                    Connecting
                  </>
                ) : (
                  "Join"
                )}
              </button>
            </form>

            {/* Live Connection Status Feedback Bar */}
            {connectionStatus !== "idle" && (
              <div
                className={`mt-3 flex items-center gap-2 rounded-xl border p-2.5 text-xs ${
                  connectionStatus === "connecting"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                    : connectionStatus === "connected"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : connectionStatus === "hosting"
                        ? "border-lime/30 bg-lime/10 text-lime"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {connectionStatus === "connecting" ? (
                  <Loader2 size={14} className="animate-spin shrink-0 text-sky-400" />
                ) : connectionStatus === "connected" ? (
                  <Wifi size={14} className="shrink-0 text-emerald-400" />
                ) : connectionStatus === "hosting" ? (
                  <Radio size={14} className="animate-pulse shrink-0 text-lime" />
                ) : (
                  <WifiOff size={14} className="shrink-0 text-rose-400" />
                )}
                <span className="flex-1 font-medium">{statusMessage}</span>
                {connectionStatus === "error" && (
                  <button
                    onClick={() => syncRef.current?.isHost ? handleCreateRoom() : attemptJoin(joinInput)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-200 underline"
                  >
                    <RefreshCw size={11} /> Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Room Card & Live Slot Allocation */}
          {room && (
            <div className="rounded-2xl border border-lime/30 glass-surface p-5 sm:p-6 shadow-xl">
              {/* Room Code & Quick Share Buttons */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Room Code
                    </span>
                    <div className="font-mono text-2xl font-black tracking-widest text-lime">
                      {room.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      title="Copy room code"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={13} className="text-lime" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Code
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      title="Copy direct invite link for friends"
                    >
                      {copiedLink ? (
                        <>
                          <Check size={13} className="text-lime" /> Link Copied
                        </>
                      ) : (
                <>
                  <LinkIcon size={13} /> Copy Invite Link
                </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Mode:{" "}
                    <strong className="text-white capitalize">{room.mode}</strong>
                  </span>
                  <span>
                    Format:{" "}
                    <strong className="text-lime uppercase">{room.format}</strong>
                  </span>
                </div>
              </div>

              {/* Slot Allocation Area */}
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Team Slots ({room.format})
                  </h4>
                  {isHost && (
                    <button
                      onClick={fillRemainingWithBots}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-lime hover:underline"
                      title="Fill open spots with AI bots"
                    >
                      <Bot size={13} /> Fill with Bots
                    </button>
                  )}
                </div>

                {/* Team A Slots */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Team A {room.format === "2v2" ? "(Host & Partner)" : "(Host)"}
                  </div>
                  {room.slots
                    .filter((s) => s.team === "A")
                    .map((slot) => {
                      const isMe = localSlot === slot.id;
                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                            isMe
                              ? "border-emerald-500/60 bg-emerald-500/10 shadow-sm"
                              : slot.occupied
                                ? "border-white/10 bg-black/30"
                                : "border-dashed border-white/20 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                              {slot.slotNumber}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white">
                                {slot.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {slot.role} {slot.isBot && "• AI Bot"}
                              </p>
                            </div>
                          </div>
                          {!slot.occupied ? (
                            <button
                              onClick={() => claimSlot(slot.id)}
                              className="rounded-lg border border-lime/30 bg-lime/10 px-2.5 py-1 text-[10px] font-bold text-lime hover:bg-lime/20"
                            >
                              Claim Slot
                            </button>
                          ) : isMe ? (
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              You
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                </div>

                {/* Team B Slots */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Team B{" "}
                    {room.format === "2v2"
                      ? "(Opponent 1 & 2)"
                      : "(Opponent)"}
                  </div>
                  {room.slots
                    .filter((s) => s.team === "B")
                    .map((slot) => {
                      const isMe = localSlot === slot.id;
                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                            isMe
                              ? "border-sky-500/60 bg-sky-500/10 shadow-sm"
                              : slot.occupied
                                ? "border-white/10 bg-black/30"
                                : "border-dashed border-white/20 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300">
                              {slot.slotNumber}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white">
                                {slot.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {slot.role} {slot.isBot && "• AI Bot"}
                              </p>
                            </div>
                          </div>
                          {!slot.occupied ? (
                            <button
                              onClick={() => claimSlot(slot.id)}
                              className="rounded-lg border border-lime/30 bg-lime/10 px-2.5 py-1 text-[10px] font-bold text-lime hover:bg-lime/20"
                            >
                              Claim Slot
                            </button>
                          ) : isMe ? (
                            <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                              You
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                </div>

                {/* Match Launch or Ready State */}
                <div className="mt-5 pt-2">
                  {isHost ? (
                    <button
                      onClick={handleLaunchMatch}
                      className="w-full rounded-xl bg-lime py-3 text-center text-xs font-bold uppercase tracking-wider text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90 active:scale-95"
                    >
                      Start Match ({room.mode})
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-3 text-xs font-bold text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-lime animate-ping" />
                      Connected! Waiting for host to launch...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

