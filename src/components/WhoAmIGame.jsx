import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Lock,
  Sparkles,
  UserRound,
} from "lucide-react";
import confetti from "canvas-confetti";
import { mysteryPlayers } from "../data/arcadeData";
import FlagIcon from "./FlagIcon";

export default function WhoAmIGame({ onBack, onComplete, initialIndex }) {
  const [index, setIndex] = useState(() =>
    initialIndex !== undefined
      ? initialIndex % mysteryPlayers.length
      : Math.floor(Math.random() * mysteryPlayers.length),
  );
  const [revealed, setRevealed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const mystery = mysteryPlayers[index % mysteryPlayers.length];

  // Normalized comparison
  const normalize = (val) =>
    (val || "")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  function submit(event) {
    event?.preventDefault();
    if (!answer.trim() || result !== null) return;

    const correct = normalize(answer) === normalize(mystery.name);
    setResult(correct);

    const points = correct ? Math.max(10, 50 - revealed * 10) : 0;
    onComplete?.(points, correct);

    if (correct) {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.65 },
        colors: ["#22c55e", "#eaf7dd", "#38bdf8"],
      });
    }
  }

  function next() {
    setIndex((prev) => {
      let nextIdx = Math.floor(Math.random() * mysteryPlayers.length);
      if (nextIdx === prev && mysteryPlayers.length > 1) {
        nextIdx = (prev + 1) % mysteryPlayers.length;
      }
      return nextIdx;
    });
    setRevealed(0);
    setAnswer("");
    setResult(null);
  }

  // Country code helper
  const countryCode =
    mystery.nationalityCode ||
    {
      Argentina: "ar",
      Brazil: "br",
      Croatia: "hr",
      France: "fr",
      Portugal: "pt",
      "United States": "us",
      Norway: "no",
      Belgium: "be",
    }[mystery.country] ||
    "es";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-7 sm:px-7">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft size={14} /> Back to Modes
          </button>
          <button
            onClick={next}
            className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime"
            title="Randomize player"
          >
            <Sparkles size={13} className="text-lime" /> Shuffle Player
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
            Who Am I?
          </span>
          <span className="text-xs text-slate-400">
            • Stats & Silhouette Mystery
          </span>
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          Unmask the Mystery Icon
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Decipher masked statistics, silhouette clarity, and gradual hints to
          name the football legend.
        </p>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 glass-surface p-6 sm:p-8">
        {/* Silhouette & Mystery Avatar */}
        <div className="relative mx-auto flex flex-col items-center">
          <div
            className={`relative grid h-32 w-32 place-items-center rounded-full border border-white/15 bg-black/40 shadow-inner transition duration-500 ${
              revealed >= 3 || result !== null
                ? "border-lime bg-lime/10"
                : "border-white/10"
            }`}
          >
            <UserRound
              size={64}
              className={`transition duration-500 ${
                result !== null
                  ? "text-lime drop-shadow-md"
                  : revealed >= 2
                    ? "text-slate-300 blur-none"
                    : revealed >= 1
                      ? "text-slate-500 blur-[1px]"
                      : "text-slate-700 blur-[3px]"
              }`}
            />
          </div>

          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Identity Status:
            </span>
            <span className="ml-1.5 font-mono text-xs font-semibold text-lime">
              {result !== null
                ? "UNMASKED"
                : revealed === 0
                  ? "LOCKED"
                  : `LEVEL ${revealed} REVEALED`}
            </span>
          </div>
        </div>

        {/* Masked Attribute Badges */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Nationality Badge */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Nationality
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {revealed >= 1 || result !== null ? (
                <>
                  <FlagIcon code={countryCode} className="h-4 w-6 rounded" />
                  <span className="text-xs font-bold text-white">
                    {mystery.country}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                  <Lock size={12} /> ???
                </span>
              )}
            </div>
          </div>

          {/* Position & Shirt Number */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Position / Shirt
            </span>
            <div className="mt-1">
              {revealed >= 2 || result !== null ? (
                <span className="text-xs font-bold text-white">
                  {mystery.position} • #{mystery.shirt}
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                  <Lock size={12} /> ???
                </span>
              )}
            </div>
          </div>

          {/* Current / Senior Club */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Primary Club
            </span>
            <div className="mt-1">
              {revealed >= 3 || result !== null ? (
                <span className="text-xs font-bold text-white">
                  {mystery.club}
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                  <Lock size={12} /> ???
                </span>
              )}
            </div>
          </div>

          {/* Career Stats / Trophies */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              Honors & Caps
            </span>
            <div className="mt-1">
              {revealed >= 3 || result !== null ? (
                <span className="text-xs font-bold text-lime">
                  {mystery.caps ? `${mystery.caps} caps` : "Legend"}
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                  <Lock size={12} /> ???
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progressive Clue Cards */}
        <div className="mt-6 space-y-2">
          {mystery.clues.slice(0, Math.max(1, revealed)).map((clue, idx) => (
            <div
              key={clue}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-3.5"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-lime/10 text-xs font-bold text-lime">
                0{idx + 1}
              </span>
              <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
                {clue}
              </p>
            </div>
          ))}
        </div>

        {/* Input & Reveal Controls */}
        {result === null ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              disabled={revealed >= mystery.clues.length}
              onClick={() => setRevealed((v) => Math.min(v + 1, mystery.clues.length))}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-40"
            >
              <Lightbulb size={14} /> Unlock Next Clue (-10 pts)
            </button>

            <form
              onSubmit={submit}
              className="flex min-w-[280px] flex-1 gap-2"
            >
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Guess mystery player name..."
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-lime/60"
              />
              <button
                type="submit"
                className="rounded-xl bg-lime px-5 text-xs font-bold text-ink shadow-md shadow-lime/20 hover:bg-lime/90 active:scale-95"
              >
                Submit Guess
              </button>
            </form>
          </div>
        ) : (
          /* Result Revealed Banner */
          <div className="animate-pop-in mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <FlagIcon code={countryCode} className="h-5 w-7 rounded" />
              <h3 className="font-display text-2xl font-black text-white">
                {mystery.name}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {result
                ? `Spot-on identification! Score: ${Math.max(10, 50 - revealed * 10)} pts`
                : "Player identity revealed."}
            </p>
            {mystery.trophies && (
              <p className="mt-2 text-xs font-semibold text-lime">
                {mystery.trophies}
              </p>
            )}
            <button
              onClick={next}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-lime px-5 py-2.5 text-xs font-bold text-ink hover:bg-lime/90"
            >
              Next Mystery Legend <ArrowRight size={14} />
            </button>
          </div>
        )}
      </section>

      <p className="text-center text-[10px] text-slate-500">
        Earlier guesses without unlocking clues score higher multipliers.
      </p>
    </div>
  );
}
