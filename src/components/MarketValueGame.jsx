import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Flame,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { marketPlayers } from "../data/arcadeData";
import FlagIcon from "./FlagIcon";
import ClubCrest from "./ClubCrest";
import useRoomBotTurn from "../hooks/useRoomBotTurn";

function seededShuffle(items) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const swap = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[swap]] = [pool[swap], pool[i]];
  }
  return pool;
}

export default function MarketValueGame({ onBack, onComplete, room = null, activePlayerId = 0, turnDeadline = 0, onTurn, onScore }) {
  const [players, setPlayers] = useState(() => seededShuffle(marketPlayers));
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [state, setState] = useState("playing");
  const [correct, setCorrect] = useState(null);

  const left = players[index];
  const right = players[index + 1];

  function guess(direction) {
    if (!right || state !== "playing") return;
    const hit =
      direction === "higher"
        ? right.value >= left.value
        : right.value <= left.value;
    if (hit) onScore?.(activePlayerId, 25, true);
    onTurn?.((activePlayerId + 1) % (room?.capacity || 2), activePlayerId, "guess");

    setCorrect(hit);
    if (hit) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBest((prev) => Math.max(prev, nextStreak));

      if (nextStreak % 5 === 0) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#eaf7dd", "#38bdf8"],
        });
      }

      if (index + 2 >= players.length) {
        setState("complete");
        onComplete?.(nextStreak * 25, true);
      } else {
        setTimeout(() => {
          setIndex((prev) => prev + 1);
          setCorrect(null);
        }, 700);
      }
    } else {
      setState("complete");
      onComplete?.(streak * 25, false);
    }
  }

  useRoomBotTurn({ room, activePlayerId, turnDeadline, turnKey: `${index}:${state}`, onAction: ({ accuracy }) => {
    if (!right || state !== "playing") return;
    const correctDirection = right.value >= left.value ? "higher" : "lower";
    const wrongDirection = correctDirection === "higher" ? "lower" : "higher";
    guess(Math.random() <= accuracy || right.value === left.value ? correctDirection : wrongDirection);
  } });

  function restart() {
    setPlayers(seededShuffle(marketPlayers));
    setIndex(0);
    setStreak(0);
    setCorrect(null);
    setState("playing");
  }

  if (!left) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-7">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft size={14} /> Back to Modes
          </button>
          <button
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime"
            title="Shuffle challenge"
          >
            <RotateCcw size={13} className="text-lime" /> Shuffle Pairs
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
            Market Value Guessr
          </span>
          <span className="text-xs text-slate-400">• Higher or Lower</span>
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          Call the Transfer Valuation
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Does the challenger carry a higher or lower market valuation than the
          benchmark star?
        </p>
      </div>

      {/* Streak Header Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 glass-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime/10 text-lime">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Current Streak
            </p>
            <p className="font-display text-2xl font-black text-white sm:text-3xl">
              {streak}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">
            Best Run
          </p>
          <p className="font-display text-2xl font-black text-lime sm:text-3xl">
            {best}
          </p>
        </div>
      </div>

      {/* Head to Head Duel Cards */}
      <section className="grid overflow-hidden rounded-2xl border border-white/10 glass-surface md:grid-cols-2">
        {/* Left Benchmark Player */}
        <div className="border-b border-white/10 p-6 sm:p-8 md:border-b-0 md:border-r">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Benchmark Player
          </span>
          <PlayerCard player={left} revealed />
        </div>

        {/* Right Challenger Player */}
        <div className="relative p-6 sm:p-8">
          <div className="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-white/10 bg-slate-950/80 font-display text-xs font-black text-lime shadow-lg md:left-0 md:top-1/2 md:-translate-y-1/2">
            VS
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            Challenger
          </span>

          {right ? (
            <PlayerCard player={right} revealed={state !== "playing"} />
          ) : (
            <div className="grid min-h-60 place-items-center text-sm text-slate-500">
              End of player database reached!
            </div>
          )}

          {/* Action Buttons */}
          {state === "playing" && right && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => guess("higher")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-bold text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90 active:scale-95"
              >
                <ArrowUp size={18} /> Higher
              </button>
              <button
                onClick={() => guess("lower")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
              >
                <ArrowDown size={18} /> Lower
              </button>
            </div>
          )}

          {/* Feedback & Restart */}
          {state === "complete" && (
            <div
              className={`mt-6 rounded-xl border p-4 text-center ${
                correct === false
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              <p className="text-sm font-bold">
                {correct === false
                  ? `Wrong call! ${right?.name} was valued at €${right?.value}m.`
                  : "Flawless run! You've traversed the entire market."}
              </p>
              <button
                onClick={restart}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                <RotateCcw size={14} /> Try Another Run
              </button>
            </div>
          )}
        </div>
      </section>

      <p className="text-center text-[10px] text-slate-500">
        Estimated values are expressed in € Millions and referenced from top
        European market reports.
      </p>
    </div>
  );
}

function PlayerCard({ player, revealed }) {
  return (
    <div className="mt-3 flex min-h-56 flex-col items-center justify-center text-center">
      <div className="relative mb-3">
        <ClubCrest
          src={player.clubLogoUrl}
          className="h-16 w-16 rounded-xl border border-white/10 bg-black/30"
          fallbackClassName="h-8 w-8"
        />
        <div className="absolute -bottom-1 -right-1">
          <FlagIcon
            code={player.nationalityCode || player.flag}
            className="h-4 w-6 rounded shadow"
          />
        </div>
      </div>

      <h3 className="font-display text-2xl font-bold tracking-tight text-white">
        {player.name}
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        {player.club} • {player.position}
        {player.age ? ` (${player.age} yrs)` : ""}
      </p>

      <div className="mt-4">
        {revealed ? (
          <span className="font-display text-4xl font-black text-lime animate-pop-in">
            €{player.value}m
          </span>
        ) : (
          <span className="rounded-xl border border-dashed border-white/20 bg-black/20 px-5 py-2 font-display text-3xl font-black text-slate-400">
            € ???
          </span>
        )}
      </div>
    </div>
  );
}
