import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Copy,
  Gamepad2,
  Radio,
  Shield,
  Sparkles,
  Swords,
  UserPlus,
  Users,
} from "lucide-react";
import { matchModes } from "../data/gameModes";
import {
  generateRoomCode,
  getRoom,
  LobbySyncEngine,
  saveRoom,
} from "../utils/lobbySync";

export default function MatchLobby({ onBack, onStart, initialRoom = null }) {
  const [format, setFormat] = useState(initialRoom?.format || "1v1");
  const [selectedMode, setSelectedMode] = useState(
    initialRoom?.mode || "invasion",
  );
  const [difficulty, setDifficulty] = useState("Top 5 European Leagues");
  const [timer, setTimer] = useState("Standard · 30 sec");
  const [nickname, setNickname] = useState("Host");
  const [joinInput, setJoinInput] = useState("");
  const [room, setRoom] = useState(initialRoom);
  const [localSlot, setLocalSlot] = useState(initialRoom?.localSlot ?? 0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const syncRef = useRef(null);

  const capacity = format === "2v2" ? 4 : 2;

  // Initialize sync engine when room code changes
  useEffect(() => {
    if (!room?.code) return;
    syncRef.current?.destroy();
    syncRef.current = new LobbySyncEngine(room.code, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      syncRef.current?.destroy();
      syncRef.current = null;
    };
  }, [room?.code]);

  function createRoom() {
    const code = generateRoomCode();
    const hostName = nickname.trim() || "Host (You)";

    let slots = [];
    if (format === "2v2") {
      slots = [
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
    } else {
      slots = [
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

    saveRoom(newRoom);
    setRoom(newRoom);
    setLocalSlot(0);
    setError("");

    syncRef.current?.broadcast(newRoom);
  }

  function handleJoinRoom(event) {
    event?.preventDefault();
    const raw = joinInput.trim().toUpperCase().replace(/\s+/g, "");
    const cleanCode = raw.startsWith("PITCH-") ? raw : `PITCH-${raw}`;

    const found = getRoom(cleanCode) || getRoom(raw);
    if (!found) {
      setError(`Room "${cleanCode}" not found. Verify the code or create one.`);
      return;
    }

    const openSlot = found.slots.find((s) => !s.occupied);
    if (!openSlot) {
      setError(`Room "${cleanCode}" is already full.`);
      return;
    }

    const myName = nickname.trim() || `Player ${openSlot.slotNumber}`;
    const updatedSlots = found.slots.map((s) =>
      s.id === openSlot.id
        ? { ...s, name: myName, occupied: true, isBot: false }
        : s,
    );

    const updatedRoom = {
      ...found,
      slots: updatedSlots,
    };

    saveRoom(updatedRoom);
    setRoom(updatedRoom);
    setLocalSlot(openSlot.id);
    setError("");

    if (syncRef.current) {
      syncRef.current.broadcast(updatedRoom);
    }
  }

  function claimSlot(slotId) {
    if (!room) return;
    const target = room.slots.find((s) => s.id === slotId);
    if (!target) return;

    const myName = nickname.trim() || `Player ${target.slotNumber}`;
    const updatedSlots = room.slots.map((s) => {
      if (s.id === localSlot) {
        // vacate current slot if not host or rename
        return s.host
          ? s
          : {
              ...s,
              name: `Open Slot (${s.role})`,
              occupied: false,
              isBot: false,
            };
      }
      if (s.id === slotId) {
        return { ...s, name: myName, occupied: true, isBot: false };
      }
      return s;
    });

    const updatedRoom = { ...room, slots: updatedSlots };
    setRoom(updatedRoom);
    setLocalSlot(slotId);
    saveRoom(updatedRoom);
    syncRef.current?.broadcast(updatedRoom);
  }

  function fillRemainingWithBots() {
    if (!room) return;
    const botNames = ["TacticsIQ Bot", "Scout Alpha", "Strikeforce AI"];
    let botIndex = 0;

    const updatedSlots = room.slots.map((s) => {
      if (!s.occupied) {
        const name = botNames[botIndex % botNames.length];
        botIndex += 1;
        return {
          ...s,
          name: `${name} (${s.role})`,
          occupied: true,
          isBot: true,
        };
      }
      return s;
    });

    const updatedRoom = { ...room, slots: updatedSlots };
    setRoom(updatedRoom);
    saveRoom(updatedRoom);
    syncRef.current?.broadcast(updatedRoom);
  }

  async function copyCode() {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard copy blocked. Please copy code manually.");
    }
  }

  function launchMatch() {
    if (!room) return;
    // ensure all open slots have names
    const finalizedSlots = room.slots.map((s) => ({
      ...s,
      occupied: true,
      name: s.occupied ? s.name : `Guest (${s.role})`,
    }));

    const launchedRoom = {
      ...room,
      slots: finalizedSlots,
      localSlot,
      status: "in-game",
    };

    saveRoom(launchedRoom);
    syncRef.current?.broadcast(launchedRoom);
    onStart(launchedRoom);
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-7 px-4 py-7 sm:px-7 lg:px-9">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/20 bg-lime/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime">
              <Swords size={13} /> Versus Arena
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold text-sky-300">
              <Radio size={12} className="animate-pulse text-sky-400" /> P2P &
              Browser Sync
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Multiplayer Match Lobby
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            Create or join a synchronized room. Battle 1v1 head-to-head or form
            co-op 2v2 squads with live scoreboards.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Room Creator & Parameter Controls */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#141f34] p-6 sm:p-8">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <Gamepad2 size={18} className="text-lime" /> Room Settings & Game
              Parameters
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure match format, difficulty pools, and question timer
              before creating the room.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Format Selection */}
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

            {/* Display Name */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Player Tag
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="Enter player nickname..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-lime/50"
              />
            </div>

            {/* Game Mode */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Selected Game Mode
              </label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-lime/50"
              >
                {matchModes.map((mode) => (
                  <option
                    key={mode.id}
                    value={mode.id}
                    className="bg-slate-900 text-white"
                  >
                    {mode.label} ({mode.detail})
                  </option>
                ))}
              </select>
            </div>

            {/* Player Pool Difficulty */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Player Pool Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-lime/50"
              >
                <option className="bg-slate-900">Top 5 European Leagues</option>
                <option className="bg-slate-900">All Leagues (Worldwide)</option>
                <option className="bg-slate-900">
                  UCL Champions & International Giants
                </option>
              </select>
            </div>

            {/* Timer Speed */}
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
              onClick={createRoom}
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-bold text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90 active:scale-95"
            >
              <Sparkles size={16} /> Create Room & Generate Code
            </button>
            {room && (
              <button
                onClick={launchMatch}
                className="inline-flex items-center gap-2 rounded-xl border border-lime/40 bg-lime/10 px-5 py-3 text-sm font-bold text-lime transition hover:bg-lime/20"
              >
                <Gamepad2 size={16} /> Launch Match Now <ArrowRight size={15} />
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Join Room & Team Slot Allocation */}
        <aside className="space-y-6">
          {/* Join Room Form */}
          <div className="rounded-2xl border border-white/10 bg-[#141f34] p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <UserPlus size={16} className="text-lime" /> Join Existing Room
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Enter a 6-character room code from your teammate or opponent.
            </p>

            <form onSubmit={handleJoinRoom} className="mt-4 flex gap-2">
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="PITCH-9X"
                maxLength={10}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-sm tracking-widest text-lime placeholder-slate-600 outline-none focus:border-lime/50"
              />
              <button
                type="submit"
                className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                Join
              </button>
            </form>

            {error && (
              <p className="mt-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
                {error}
              </p>
            )}
          </div>

          {/* Active Room & Slot Allocation Display */}
          {room && (
            <div className="rounded-2xl border border-lime/30 bg-[#111a2d] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Room Code
                  </span>
                  <div className="font-mono text-2xl font-black tracking-widest text-lime">
                    {room.code}
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  title="Copy room code"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-lime" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Slot Allocation Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Team Slots ({room.format})
                  </h4>
                  <button
                    onClick={fillRemainingWithBots}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-lime hover:underline"
                    title="Fill empty slots with bots for testing"
                  >
                    <Bot size={13} /> Fill with Bots
                  </button>
                </div>

                {/* Team A Slots */}
                <div className="mt-3 space-y-2">
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
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : slot.occupied
                                ? "border-white/10 bg-black/20"
                                : "border-dashed border-white/15 bg-white/[0.02]"
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
                              className="rounded-lg border border-lime/30 bg-lime/10 px-2 py-1 text-[10px] font-bold text-lime hover:bg-lime/20"
                            >
                              Claim Slot
                            </button>
                          ) : isMe ? (
                            <span className="text-[10px] font-bold text-emerald-400">
                              You
                            </span>
                          ) : null}
                        </div>
                      );
                    })}

                  {/* Team B Slots */}
                  <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-sky-400">
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
                              ? "border-sky-500/50 bg-sky-500/10"
                              : slot.occupied
                                ? "border-white/10 bg-black/20"
                                : "border-dashed border-white/15 bg-white/[0.02]"
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
                              className="rounded-lg border border-lime/30 bg-lime/10 px-2 py-1 text-[10px] font-bold text-lime hover:bg-lime/20"
                            >
                              Claim Slot
                            </button>
                          ) : isMe ? (
                            <span className="text-[10px] font-bold text-sky-400">
                              You
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                </div>

                <div className="mt-5">
                  <button
                    onClick={launchMatch}
                    className="w-full rounded-xl bg-lime py-3 text-center text-xs font-bold uppercase tracking-wider text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90"
                  >
                    Start Match ({room.mode})
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
