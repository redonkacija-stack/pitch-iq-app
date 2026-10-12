import { useState } from "react";
import { Check, Copy, Link as LinkIcon, RotateCcw, Swords } from "lucide-react";
import { getShareableRoomUrl } from "../utils/peerSync";

export default function LiveScoreHeader({
  room,
  scores = [0, 0, 0, 0],
  guessedCounts = { A: 0, B: 0 },
  activeTurn = 0,
  onPassTurn,
  onExitRoom,
}) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
  const teamRoster = (team) => (room.slots || [])
    .filter((slot) => slot.team === team)
    .map((slot) => `${slot.name}${slot.isBot ? ` (${slot.botDifficulty || "AI"})` : ""}`)
    .join(" & ");

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function copyLink() {
    try {
      const url = getShareableRoomUrl(room.code);
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {}
  }

  return (
    <div className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 shadow-xl shadow-black/25 backdrop-blur-2xl md:sticky md:top-16">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-1.5 px-2.5 py-1.5 sm:gap-3 sm:px-7 sm:py-3.5 lg:px-9">
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
          {/* Room info pill */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="flex items-center gap-1 rounded-lg border border-lime/30 bg-lime/10 px-1.5 py-1 text-[10px] font-bold text-lime sm:gap-1.5 sm:px-2.5 sm:text-xs">
              <Swords size={12} /> {room.format}
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-1.5 py-1 font-mono text-[10px] font-bold text-slate-300 transition hover:border-white/30 hover:text-white sm:gap-1.5 sm:px-2.5 sm:text-xs"
              title="Click to copy room code"
            >
              <span>{room.code}</span>
              {copied ? (
                <Check size={12} className="text-lime" />
              ) : (
                <Copy size={12} className="text-slate-500" />
              )}
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-1.5 py-1 text-[10px] font-semibold text-slate-300 transition hover:border-white/30 hover:text-white sm:gap-1.5 sm:px-2.5 sm:text-xs"
              title="Click to copy invite link"
            >
              <LinkIcon size={12} className={copiedLink ? "text-lime" : "text-slate-500"} />
              <span className="hidden sm:inline">{copiedLink ? "Link Copied" : "Share"}</span>
            </button>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400 sm:inline-block">
              {room.mode.toUpperCase()}
            </span>
          </div>

          {/* Turn indicator */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <span className="hidden text-[11px] text-slate-400 sm:inline">Current Turn:</span>
            <span
              className={`inline-flex max-w-[54vw] items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-bold sm:max-w-none sm:gap-1.5 sm:px-2.5 sm:text-xs ${
                activeTeam === "A"
                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border border-sky-500/40 bg-sky-500/10 text-sky-300"
              }`}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current animate-pulse sm:h-2 sm:w-2" />
              <span className="truncate">{currentSlot?.name || `Player ${activeTurn + 1}`}</span>
              <span className="shrink-0">· {activeTeam}</span>
            </span>
          </div>

          {/* Quick Controls */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {onPassTurn && (
              <button
                onClick={onPassTurn}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:gap-1.5 sm:px-2.5 sm:text-xs"
                title="Pass turn to next slot"
              >
                <RotateCcw size={11} /> <span className="hidden sm:inline">Pass Turn</span>
              </button>
            )}
            {onExitRoom && (
              <button
                onClick={onExitRoom}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-1.5 py-1 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-500/20 sm:px-2.5 sm:text-xs"
              >
                Exit
              </button>
            )}
          </div>
        </div>

        {/* Live Scoreboard Split Cards */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
          {/* Team A Score Card */}
          <div
            className={`flex min-w-0 items-center justify-between rounded-lg border p-1.5 sm:rounded-xl sm:px-5 sm:py-3.5 transition ${
              activeTeam === "A"
                ? "border-emerald-500/40 bg-emerald-950/20 shadow-md shadow-emerald-950/30"
                : "border-white/10 glass-surface"
            }`}
          >
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
              <div className="hidden -space-x-2 sm:flex">
                {(room.slots || []).filter((slot) => slot.team === "A").map((slot) => (
                  <span key={slot.id} title={slot.name} className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-900 bg-emerald-500/20 text-[10px] font-extrabold uppercase text-emerald-200 shadow-md shadow-emerald-950/40">
                    {slot.isBot ? "AI" : (slot.name || "P").slice(0, 1)}
                  </span>
                ))}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase sm:text-xs">
                    Team A
                  </span>
                  {activeTeam === "A" && (
                    <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[8px] font-bold text-emerald-300 sm:px-1.5 sm:text-[9px]">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="hidden max-w-[34vw] truncate text-[11px] text-slate-400 sm:block">
                  {teamRoster("A") || (is2v2 ? "Slot 1 & Slot 2" : "Slot 1")}
                </p>
                <p className="text-[9px] text-slate-500 sm:mt-0.5 sm:text-[10px]">
                  Guessed {" "}
                  <span className="font-semibold text-slate-300">
                    {guessedCounts?.A ?? 0}
                  </span>
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="score-glow font-display text-lg font-black tabular-nums text-white sm:text-3xl">
                {teamAScore}
              </div>
              <span className="text-[8px] uppercase tracking-wider text-slate-500 sm:text-[10px]">
                Pts
              </span>
            </div>
          </div>

          {/* Team B Score Card */}
          <div
            className={`flex min-w-0 items-center justify-between rounded-lg border p-1.5 sm:rounded-xl sm:px-5 sm:py-3.5 transition ${
              activeTeam === "B"
                ? "border-sky-500/40 bg-sky-950/20 shadow-md shadow-sky-950/30"
                : "border-white/10 glass-surface"
            }`}
          >
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
              <div className="hidden -space-x-2 sm:flex">
                {(room.slots || []).filter((slot) => slot.team === "B").map((slot) => (
                  <span key={slot.id} title={slot.name} className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-900 bg-sky-500/20 text-[10px] font-extrabold uppercase text-sky-200 shadow-md shadow-sky-950/40">
                    {slot.isBot ? "AI" : (slot.name || "P").slice(0, 1)}
                  </span>
                ))}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[10px] font-black tracking-wider text-sky-400 uppercase sm:text-xs">
                    Team B
                  </span>
                  {activeTeam === "B" && (
                    <span className="rounded bg-sky-500/20 px-1 py-0.5 text-[8px] font-bold text-sky-300 sm:px-1.5 sm:text-[9px]">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="hidden max-w-[34vw] truncate text-[11px] text-slate-400 sm:block">
                  {teamRoster("B") || (is2v2 ? "Slot 3 & Slot 4" : "Slot 2")}
                </p>
                <p className="text-[9px] text-slate-500 sm:mt-0.5 sm:text-[10px]">
                  Guessed {" "}
                  <span className="font-semibold text-slate-300">
                    {guessedCounts?.B ?? 0}
                  </span>
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="score-glow font-display text-lg font-black tabular-nums text-white sm:text-3xl">
                {teamBScore}
              </div>
              <span className="text-[8px] uppercase tracking-wider text-slate-500 sm:text-[10px]">
                Pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
