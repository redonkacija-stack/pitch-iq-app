import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Info,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useGame } from "../context/useGame";
import { useSound } from "../hooks/useSound";
import FlagIcon from "./FlagIcon";
import ClubCrest from "./ClubCrest";
import useRoomBotTurn from "../hooks/useRoomBotTurn";

// Formation node positions on tactical pitch board
const formationSetups = {
  "3-2-4-1": [
    { pos: "GK", x: 50, y: 88 },
    { pos: "CB", x: 25, y: 72 },
    { pos: "CB", x: 50, y: 74 },
    { pos: "CB", x: 75, y: 72 },
    { pos: "DM", x: 38, y: 56 },
    { pos: "DM", x: 62, y: 56 },
    { pos: "LW", x: 16, y: 38 },
    { pos: "AM", x: 38, y: 36 },
    { pos: "AM", x: 62, y: 36 },
    { pos: "RW", x: 84, y: 38 },
    { pos: "ST", x: 50, y: 20 },
  ],
  "4-4-2": [
    { pos: "GK", x: 50, y: 88 },
    { pos: "LB", x: 18, y: 72 },
    { pos: "CB", x: 38, y: 74 },
    { pos: "CB", x: 62, y: 74 },
    { pos: "RB", x: 82, y: 72 },
    { pos: "LM", x: 18, y: 48 },
    { pos: "CM", x: 38, y: 52 },
    { pos: "CM", x: 62, y: 52 },
    { pos: "RM", x: 82, y: 48 },
    { pos: "ST", x: 38, y: 24 },
    { pos: "ST", x: 62, y: 24 },
  ],
  "4-3-3": [
    { pos: "GK", x: 50, y: 88 },
    { pos: "LB", x: 18, y: 72 },
    { pos: "CB", x: 38, y: 74 },
    { pos: "CB", x: 62, y: 74 },
    { pos: "RB", x: 82, y: 72 },
    { pos: "DM", x: 50, y: 56 },
    { pos: "CM", x: 32, y: 46 },
    { pos: "CM", x: 68, y: 46 },
    { pos: "LW", x: 22, y: 26 },
    { pos: "ST", x: 50, y: 20 },
    { pos: "RW", x: 78, y: 26 },
  ],
  "3-4-2-1": [
    { pos: "GK", x: 50, y: 88 },
    { pos: "CB", x: 25, y: 74 },
    { pos: "CB", x: 50, y: 76 },
    { pos: "CB", x: 75, y: 74 },
    { pos: "LWB", x: 15, y: 50 },
    { pos: "CM", x: 38, y: 56 },
    { pos: "CM", x: 62, y: 56 },
    { pos: "RWB", x: 85, y: 50 },
    { pos: "AM", x: 35, y: 34 },
    { pos: "AM", x: 65, y: 34 },
    { pos: "ST", x: 50, y: 20 },
  ],
};

function TacticalPitchBoard({ formation }) {
  const nodes = formationSetups[formation] || formationSetups["4-3-3"];

  return (
    <div className="relative mx-auto aspect-[1.25/1] w-full max-w-[420px] overflow-hidden rounded-xl border border-white/20 bg-[#0d2a1b] p-3 shadow-inner">
      {/* Pitch markings */}
      <div className="absolute inset-2 rounded-lg border border-white/25" />
      <div className="absolute left-1/2 top-1/2 h-[26%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/25" />
      <div className="absolute left-1/2 top-2 h-[20%] w-[42%] -translate-x-1/2 border-b border-l border-r border-white/25" />
      <div className="absolute bottom-2 left-1/2 h-[20%] w-[42%] -translate-x-1/2 border-t border-l border-r border-white/25" />

      {/* Formation title watermark */}
      <div className="absolute left-3 top-3 font-mono text-[10px] font-bold text-lime/80 uppercase">
        {formation} System Map
      </div>

      {/* Player nodes */}
      {nodes.map((n, i) => (
        <div
          key={`${n.pos}-${i}`}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full border border-lime/80 bg-lime text-[9px] font-black text-ink shadow-sm sm:h-7 sm:w-7 sm:text-[10px]">
            {n.pos}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TacticsGame({
  challenge,
  isDaily: _isDaily,
  onBack,
  onNext,
  onComplete,
  room = null,
  activePlayerId = 0,
  turnDeadline = 0,
  onTurn,
  onScore,
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
    onComplete?.(score, correct);
    if (correct) onScore?.(activePlayerId, score, true);
    playSound(correct ? "success" : "error");
    if (correct) {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.66 },
        colors: ["#22c55e", "#eaf7dd", "#5eac7c"],
      });
    }
    onTurn?.((activePlayerId + 1) % (room?.capacity || 2), activePlayerId, "guess");
  }

  useRoomBotTurn({ room, activePlayerId, turnDeadline, turnKey: choice || "ready", onAction: ({ accuracy }) => {
    if (choice) return;
    const wrong = challenge.options.filter((option) => option !== challenge.answer);
    selectOption(Math.random() <= accuracy || !wrong.length ? challenge.answer : wrong[Math.floor(Math.random() * wrong.length)]);
  } });

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-14 pt-6 sm:px-7 sm:pt-8 lg:px-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <ArrowLeft size={14} /> Back to Modes
            </button>
            {onNext && (
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime"
                title="Shuffle tactic"
              >
                <Sparkles size={13} className="text-lime" /> Shuffle Tactic
              </button>
            )}
          </div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-orange-200">
            <Crosshair size={13} /> Tactical Breakdown{" "}
            <span className="text-white/25">/</span> Formation & System
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase sm:text-4xl">
            Decode the Tactical Mastermind
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Analyze formation setups and core instructions to deduce the manager
            behind the philosophy.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-bold text-lime">
          Formation: {challenge.formation || "Custom"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Tactical Principles */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[.09] glass-surface p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lime">
                Scouting Dossier
              </p>
              <h2 className="mt-1 font-display text-xl font-bold uppercase sm:text-2xl">
                {challenge.question}
              </h2>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-lime/20 bg-lime/10 text-lime">
              <Crosshair size={18} />
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            {challenge.principles.map((principle, index) => (
              <div
                key={principle}
                className="flex gap-3 rounded-xl border border-white/[.08] bg-black/20 p-3.5 transition hover:border-white/15"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-lime/10 font-display text-xs font-bold text-lime">
                  0{index + 1}
                </span>
                <p className="self-center text-xs leading-relaxed text-slate-200 sm:text-sm">
                  {principle}
                </p>
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Select the Manager:
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {challenge.options.map((option, index) => {
                const selected = choice === option;
                const isAnswer = result && option === challenge.answer;
                const isWrong = selected && result && !result.correct;
                return (
                  <button
                    key={option}
                    onClick={() => selectOption(option)}
                    disabled={Boolean(choice)}
                    className={`flex min-h-[58px] items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      isAnswer
                        ? "border-lime bg-lime/10 text-lime"
                        : isWrong
                          ? "border-rose-400 bg-rose-500/10 text-rose-200"
                          : choice
                            ? "border-white/5 bg-white/[0.01] opacity-40 text-slate-500"
                            : "border-white/10 bg-white/[0.03] hover:border-lime/40 hover:bg-lime/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 font-semibold text-sm">
                      <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-xs text-slate-400">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <FlagIcon
                        code={challenge.optionNationalityCodes?.[index]}
                        className="h-3.5 w-5"
                      />
                      <span>{option}</span>
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
          </div>
        </section>

        {/* Right Column: Tactical Pitch Setup Display */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 glass-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tactical Pitch Layout
              </h3>
              <span className="rounded bg-lime/10 px-2 py-0.5 font-mono text-[11px] font-bold text-lime">
                {challenge.formation || "4-3-3"}
              </span>
            </div>
            <TacticalPitchBoard formation={challenge.formation || "4-3-3"} />
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Interactive formation shape and pressing structures.
            </p>
          </div>

          {result && (
            <div className="animate-pop-in rounded-2xl border border-lime/30 bg-[#101b2e] p-5">
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    result.correct
                      ? "bg-lime/20 text-lime"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {result.correct ? <Trophy size={18} /> : <Info size={18} />}
                </span>
                <div>
                  <h4 className="font-display text-lg font-bold">
                    {result.correct
                      ? "Tactical Masterclass!"
                      : `Mastermind: ${challenge.answer}`}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <ClubCrest
                      src={challenge.teamLogoUrl}
                      className="h-5 w-5"
                      fallbackClassName="h-3 w-3"
                    />
                    <FlagIcon
                      code={challenge.managerNationalityCode}
                      className="h-3 w-4.5"
                    />
                    <span>
                      {challenge.answer}
                      {challenge.team ? ` · ${challenge.team}` : ""}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {challenge.explanation}
                  </p>
                  {onNext && (
                    <button
                      onClick={onNext}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-lime px-3.5 py-2 text-xs font-bold text-ink hover:bg-lime/90"
                    >
                      Next Breakdown <ArrowRight size={13} />
                    </button>
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
