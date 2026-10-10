import { useState } from "react";
import { Check, Copy, RotateCcw, Shield, Swords } from "lucide-react";

export default function LiveScoreHeader({
  room,
  scores = [0, 0, 0, 0],
  guessedCounts = { A: 0, B: 0 },
  activeTurn = 0,
  onPassTurn,
  onExitRoom,
}) {
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const is2v2 = room.format === "2v2";

  // Calculate team scores
  const teamAScore = is2v2
    ? (scores[0] || 0) + (scores[1] || 0)
    : scores[0] || 0;
  const teamBScore = is2v2
    ? (scores[2] || 0) + (scores[3] || 0)
    : scores[1] || 0;

  const currentSlot = room.slots?.[activeTurn] || room.slots?.[0];
  const activeTeam = currentSlot?.team || "A";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="sticky top-16 z-20 border-b border-white/10 bg-[#0c1424]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 py-3 sm:px-7 sm:py-3.5 lg:px-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Room info pill */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs font-bold text-lime">
              <Swords size={13} /> {room.format} Match
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-xs font-bold text-slate-300 transition hover:border-white/30 hover:text-white"
              title="Click to copy room code"
            >
              <span>{room.code}</span>
              {copied ? (
                <Check size={12} className="text-lime" />
              ) : (
                <Copy size={12} className="text-slate-500" />
              )}
            </button>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400 sm:inline-block">
              {room.mode.toUpperCase()}
            </span>
          </div>

          {/* Turn indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Current Turn:</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                activeTeam === "A"
                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border border-sky-500/40 bg-sky-500/10 text-sky-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              Slot {currentSlot?.slotNumber || activeTurn + 1}:{" "}
              {currentSlot?.name || `Player ${activeTurn + 1}`} (Team {activeTeam})
            </span>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            {onPassTurn && (
              <button
                onClick={onPassTurn}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                title="Pass turn to next slot"
              >
                <RotateCcw size={12} /> Pass Turn
              </button>
            )}
            {onExitRoom && (
              <button
                onClick={onExitRoom}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
              >
                Exit Room
              </button>
            )}
          </div>
        </div>

        {/* Live Scoreboard Split Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Team A Score Card */}
          <div
            className={`flex items-center justify-between rounded-xl border p-3 sm:px-5 sm:py-3.5 transition ${
              activeTeam === "A"
                ? "border-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-950/30"
                : "border-white/10 bg-[#121c2e]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Shield size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
                    Team A
                  </span>
                  {activeTeam === "A" && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {is2v2 ? "Slot 1 (Host) & Slot 2 (Partner)" : "Slot 1 (Host)"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Guessed:{" "}
                  <span className="font-semibold text-slate-300">
                    {guessedCounts?.A ?? 0}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-black text-white sm:text-3xl">
                {teamAScore}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Points
              </span>
            </div>
          </div>

          {/* Team B Score Card */}
          <div
            className={`flex items-center justify-between rounded-xl border p-3 sm:px-5 sm:py-3.5 transition ${
              activeTeam === "B"
                ? "border-sky-500/40 bg-sky-950/20 shadow-md shadow-sky-950/30"
                : "border-white/10 bg-[#121c2e]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
                <Shield size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-sky-400 uppercase">
                    Team B
                  </span>
                  {activeTeam === "B" && (
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {is2v2
                    ? "Slot 3 (Opponent 1) & Slot 4 (Opponent 2)"
                    : "Slot 2 (Opponent)"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Guessed:{" "}
                  <span className="font-semibold text-slate-300">
                    {guessedCounts?.B ?? 0}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-black text-white sm:text-3xl">
                {teamBScore}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
