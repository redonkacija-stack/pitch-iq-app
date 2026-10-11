import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Link2,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { duoLinks } from "../data/arcadeData";

export default function DuoLinkGame({ onBack, onComplete }) {
  const [rounds, setRounds] = useState(() =>
    [...duoLinks].sort(() => Math.random() - 0.5),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);

  const round = rounds[index % rounds.length];

  function choose(option) {
    if (locked) return;
    const hit = option === round.shared;
    setSelected(option);
    setLocked(true);
    setResult(hit);

    if (hit) {
      const nextScore = score + 30;
      setScore(nextScore);
      setStreak((s) => s + 1);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.65 },
        colors: ["#22c55e", "#38bdf8", "#eab308"],
      });
    } else {
      setStreak(0);
    }

    if (index === rounds.length - 1) {
      onComplete?.(score + (hit ? 30 : 0), hit);
    }
  }

  function restart() {
    setRounds([...duoLinks].sort(() => Math.random() - 0.5));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setLocked(false);
    setResult(null);
  }

  function next() {
    if (index >= rounds.length - 1) {
      restart();
    } else {
      setIndex((v) => v + 1);
      setSelected(null);
      setLocked(false);
      setResult(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-7 sm:px-7">
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
            title="Restart & shuffle duos"
          >
            <RotateCcw size={13} className="text-lime" /> Shuffle Duos
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
            Duo Link
          </span>
          <span className="text-xs text-slate-400">• Teammate Chain</span>
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          Connect Football Superstars
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Identify the shared club or squad where both legends shared a dressing
          room.
        </p>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 glass-surface p-6 sm:p-8">
        {/* Progress & Streak Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="font-mono text-xs text-slate-400">
            Round {index + 1} of {rounds.length}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Points:</span>
            <span className="font-display text-sm font-bold text-white">
              {score}
            </span>
            <span className="text-slate-600">|</span>
            <Flame
              size={14}
              className={streak > 0 ? "text-lime" : "text-slate-600"}
            />
            <span className="font-mono text-xs font-bold text-lime">
              {streak} streak
            </span>
          </div>
        </div>

        {/* The Two Stars Chain Layout */}
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <PlayerCard name={round.first} />

          <div className="flex flex-col items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-lime/30 bg-lime/10 text-lime shadow-lg">
              <Link2 size={20} />
            </span>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Shared Club
            </span>
          </div>

          <PlayerCard name={round.second} />
        </div>

        {/* Choice Buttons */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {round.options.map((option) => {
            const isCorrect = locked && option === round.shared;
            const isWrong = selected === option && !result;

            return (
              <button
                key={option}
                disabled={locked}
                onClick={() => choose(option)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left font-semibold transition ${
                  isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                    : isWrong
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                      : "border-white/10 bg-black/20 hover:border-lime/40 hover:bg-white/[0.03] text-white"
                }`}
              >
                <span className="text-sm">{option}</span>
                {isCorrect ? (
                  <Check size={18} className="text-emerald-400" />
                ) : isWrong ? (
                  <X size={18} className="text-rose-400" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Post-Guess Fact Callout */}
        {locked && (
          <div className="animate-pop-in mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  className={`text-xs font-bold ${
                    result ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {result
                    ? "Link successfully identified!"
                    : `Incorrect. The shared dressing room was: ${round.shared}`}
                </p>
                {round.fact && (
                  <p className="mt-1 text-xs text-slate-400">{round.fact}</p>
                )}
              </div>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-xs font-bold text-ink hover:bg-lime/90 active:scale-95"
              >
                {index === rounds.length - 1 ? "Complete Challenge" : "Next Duo"}
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function PlayerCard({ name }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-slate-400">
        <Users size={22} />
      </div>
      <p className="mt-3 font-display text-base font-bold text-white sm:text-lg">
        {name}
      </p>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        Football Star
      </span>
    </div>
  );
}
