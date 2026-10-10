import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Info,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useGame } from "../context/useGame";
import { useSound } from "../hooks/useSound";

export default function TacticsGame({
  challenge,
  isDaily,
  onBack,
  onNext,
  onComplete,
}) {
  const { stats } = useGame();
  const playSound = useSound(stats.soundEnabled);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);

  function selectOption(option) {
    if (choice) return;
    const correct = option === challenge.answer;
    const score = correct ? 250 : 0;
    setChoice(option);
    setResult({ correct, score });
    onComplete(score, correct);
    playSound(correct ? "success" : "error");
    if (correct)
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.66 },
        colors: ["#22c55e", "#eaf7dd", "#5eac7c"],
      });
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-14 pt-6 sm:px-7 sm:pt-8 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-orange-200">
            <Crosshair size={13} /> Tactical breakdown{" "}
            <span className="text-white/25">/</span> identify the coach
          </p>
          <h1 className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">
            Read between the lines.
          </h1>
          <p className="mt-2 text-sm text-mist">
            Four clues. One tactical identity. Pick your answer.
          </p>
        </div>
        <button
          onClick={onBack}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-mist transition hover:text-white"
          aria-label="Exit game"
        >
          <ArrowLeft size={16} />
        </button>
      </div>
      <section className="relative overflow-hidden rounded-2xl border border-white/[.09] bg-[#172338] p-5 sm:p-8">
        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/[.06]" />
        <div className="absolute -right-2 -top-6 h-44 w-44 rounded-full border border-white/[.06]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-lime">
                The scouting report
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase sm:text-3xl">
                {challenge.question}
              </h2>
            </div>
            <span className="hidden h-12 w-12 place-items-center rounded-full border border-lime/20 bg-lime/[.08] text-lime sm:grid">
              <Crosshair size={20} />
            </span>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {challenge.principles.map((principle, index) => (
              <div
                key={principle}
                className="flex min-h-[76px] gap-3 rounded-lg border border-white/[.08] bg-black/15 p-3.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-lime/10 font-display text-sm font-bold text-lime">
                  0{index + 1}
                </span>
                <p className="self-center text-sm leading-relaxed text-white/80">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold uppercase">
            Choose the manager
          </h3>
          <span className="text-[10px] uppercase tracking-[.14em] text-mist">
            Select one answer
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {challenge.options.map((option, index) => {
            const selected = choice === option;
            const isAnswer = result && option === challenge.answer;
            const isWrong = selected && result && !result.correct;
            return (
              <button
                key={option}
                onClick={() => selectOption(option)}
                disabled={Boolean(choice)}
                className={`flex min-h-[58px] items-center justify-between rounded-lg border px-4 text-left transition ${isAnswer ? "border-lime/45 bg-lime/10 text-lime" : isWrong ? "border-red-300/30 bg-red-300/[.07] text-red-100" : choice ? "border-white/[.06] bg-white/[.02] text-mist/50" : "border-white/10 bg-white/[.035] hover:border-lime/35 hover:bg-lime/[.05]"}`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 font-display text-xs font-bold text-mist">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-semibold">{option}</span>
                </span>
                {isAnswer ? (
                  <Check size={18} />
                ) : isWrong ? (
                  <X size={18} />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
      {result && (
        <section className="animate-pop-in mt-5 rounded-2xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${result.correct ? "bg-lime/10 text-lime" : "bg-orange-200/10 text-orange-100"}`}
            >
              {result.correct ? <Trophy size={18} /> : <Info size={18} />}
            </span>
            <div>
              <p className="font-display text-2xl font-bold uppercase">
                {result.correct
                  ? "Good read"
                  : `The answer: ${challenge.answer}`}
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
                {challenge.explanation}
              </p>
              <p className="mt-3 text-xs font-semibold text-lime">
                {result.score} points earned
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={isDaily ? onNext : onBack}
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-[#4ade80]"
            >
              {isDaily ? "Continue daily set" : "Back to hub"}{" "}
              <ArrowRight size={15} />
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-mist transition hover:text-white"
            >
              <RotateCcw size={15} /> Exit round
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
