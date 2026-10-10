import { useEffect, useEffectEvent, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  Lightbulb,
  MapPin,
  Trophy,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useGame } from "../context/useGame";
import { useSound } from "../hooks/useSound";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default function TransferGame({
  challenge,
  isDaily,
  onBack,
  onNext,
  onComplete,
}) {
  const { stats } = useGame();
  const playSound = useSound(stats.soundEnabled);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [hintsShown, setHintsShown] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState(null);

  const tick = useEffectEvent(() => {
    if (seconds <= 1) {
      setSeconds(0);
      finishRound(false);
    } else {
      setSeconds(seconds - 1);
    }
  });

  useEffect(() => {
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  function finishRound(won) {
    if (result) return;
    const score = won
      ? Math.max(50, 250 + seconds * 4 - hintsShown * 45 - mistakes * 20)
      : 0;
    setResult({ won, score });
    onComplete(score, won);
    if (won)
      confetti({
        particleCount: 65,
        spread: 58,
        origin: { y: 0.66 },
        colors: ["#22c55e", "#eaf7dd", "#5eac7c"],
      });
  }

  function submit(event) {
    event.preventDefault();
    if (!answer.trim() || result) return;
    const accepted = [challenge.answer, ...challenge.aliases].some(
      (name) => normalize(name) === normalize(answer),
    );
    if (accepted) {
      setFeedback("That’s the one. Career mapped.");
      playSound("success");
      finishRound(true);
    } else {
      setMistakes((count) => count + 1);
      setFeedback("Not quite. Read the route again.");
      setShake(true);
      window.setTimeout(() => setShake(false), 360);
      playSound("error");
    }
  }

  function revealHint() {
    if (hintsShown >= challenge.hints.length || result) return;
    setHintsShown((count) => count + 1);
    playSound("click");
  }

  const hintCost = hintsShown * 45;
  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pb-14 pt-6 sm:px-7 sm:pt-8 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-cyan-200">
            <MapPin size={13} /> Transfer chain{" "}
            <span className="text-white/25">/</span> career path
          </p>
          <h1 className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">
            Where did this career go?
          </h1>
          <p className="mt-2 text-sm text-mist">
            Follow the clubs in order. Name the player before time runs out.
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold tabular-nums ${seconds <= 8 ? "border-red-300/30 bg-red-400/10 text-red-200" : "border-white/10 bg-white/[.04]"}`}
        >
          <Clock3 size={15} /> 0:{String(seconds).padStart(2, "0")}
        </div>
      </div>
      <section className="glass-panel overflow-hidden rounded-2xl p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-mist">
              A career in motion
            </p>
            <p className="mt-1 text-xs text-mist">
              {challenge.clubs.length} club spells{" "}
              <span className="mx-1 text-white/20">·</span> starting nation{" "}
              <span className="ml-1 text-lg">{challenge.nationality}</span>
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/80">
            {challenge.clubs[0].years} —{" "}
            {challenge.clubs.at(-1).years.split("–").at(-1)}
          </div>
        </div>
        <div className="relative mt-6">
          <div className="absolute bottom-3 left-[19px] top-3 w-px bg-gradient-to-b from-lime/60 via-white/15 to-white/5 sm:left-1/2 sm:-translate-x-1/2" />
          <div className="space-y-3 sm:space-y-0">
            {challenge.clubs.map((club, index) => (
              <div
                key={`${club.name}-${club.years}`}
                className={`relative flex items-center gap-4 sm:min-h-[66px] sm:w-1/2 ${index % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:ml-auto sm:flex-row-reverse sm:pl-10 sm:text-left"}`}
              >
                <span
                  className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${index === 0 ? "border-lime/45 bg-lime/10 text-lime" : "border-white/15 bg-panel text-mist"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className={`flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border border-white/[.07] bg-white/[.025] px-3 py-2.5 sm:justify-start ${index % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
                >
                  <div
                    className={`min-w-0 ${index % 2 === 1 ? "sm:text-right" : ""}`}
                  >
                    <p className="truncate text-sm font-bold">{club.name}</p>
                    <p className="text-[10px] uppercase tracking-[.12em] text-mist">
                      {club.country}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-black/20 px-2 py-1 text-[11px] font-semibold tabular-nums text-white/75">
                    {club.years}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_310px]">
        <section
          className={`glass-panel rounded-2xl p-4 sm:p-5 ${shake ? "animate-shake-x border-red-300/20" : ""}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-bold uppercase">
                Name the player
              </p>
              <p className="mt-1 text-xs text-mist">
                Spelling accents are optional.
              </p>
            </div>
            <span className="text-xs font-semibold text-mist">
              Base score: <b className="text-lime">250</b>
            </span>
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(result)}
              placeholder="Player name..."
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-lime/50"
              aria-label="Player name"
            />
            <button
              disabled={Boolean(result)}
              className="rounded-lg bg-lime px-4 text-sm font-bold text-ink transition hover:bg-[#4ade80] disabled:opacity-50"
            >
              Lock in
            </button>
          </form>
          <div
            className={`mt-3 flex min-h-7 items-center gap-2 text-xs ${result?.won ? "text-lime" : feedback ? "text-red-100/80" : "text-mist"}`}
          >
            <span>
              {result?.won ? (
                <Check size={14} />
              ) : feedback ? (
                <X size={14} />
              ) : (
                <BadgeCheck size={14} />
              )}
            </span>
            {feedback || "One answer. Every stop counts."}
          </div>
        </section>
        <section className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-bold uppercase">
                Scouting notes
              </p>
              <p className="mt-1 text-xs text-mist">
                Hints reduce your possible score by 45.
              </p>
            </div>
            <button
              disabled={hintsShown >= challenge.hints.length || Boolean(result)}
              onClick={revealHint}
              className="inline-flex items-center gap-1.5 rounded-md border border-lime/20 bg-lime/[.08] px-2.5 py-2 text-xs font-bold text-lime transition hover:bg-lime/15 disabled:opacity-40"
            >
              <Lightbulb size={14} /> Reveal
            </button>
          </div>
          <div className="mt-3 min-h-[74px] rounded-lg border border-white/[.07] bg-black/15 p-3">
            {hintsShown ? (
              <ul className="space-y-2">
                {challenge.hints.slice(0, hintsShown).map((hint, index) => (
                  <li
                    key={hint}
                    className="flex gap-2 text-xs leading-relaxed text-white/80"
                  >
                    <span className="font-bold text-lime">0{index + 1}</span>
                    {hint}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-relaxed text-mist">
                No clues revealed. {challenge.clubs.length} stops are your map.
              </p>
            )}
          </div>
          {hintsShown > 0 && (
            <p className="mt-2 text-[10px] text-mist">
              Hint penalty: −{hintCost} pts
            </p>
          )}
        </section>
      </div>
      {result && (
        <section className="animate-pop-in mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-lime/20 bg-lime/[.08] p-5">
          <div className="flex items-center gap-3">
            <Trophy className="text-lime" size={23} />
            <div>
              <p className="font-display text-2xl font-bold uppercase">
                {result.won ? "Path identified" : "Time called"}
              </p>
              <p className="text-xs text-mist">
                {result.won ? challenge.answer : `It was ${challenge.answer}.`}{" "}
                {result.score} points earned.
              </p>
            </div>
          </div>
          <p className="hidden max-w-sm text-xs leading-relaxed text-mist md:block">
            {challenge.fact}
          </p>
          <button
            onClick={isDaily ? onNext : onBack}
            className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-[#4ade80]"
          >
            {isDaily ? "Continue daily set" : "Back to hub"}{" "}
            <ArrowRight size={15} />
          </button>
        </section>
      )}
      {!result && (
        <p className="mt-4 text-right text-xs text-mist">
          Incorrect guesses: {mistakes}{" "}
          <span className="mx-2 text-white/20">·</span> Current score after
          clues:{" "}
          <span className="font-bold text-white">
            {Math.max(0, 250 + seconds * 4 - hintCost - mistakes * 20)}
          </span>
        </p>
      )}
    </div>
  );
}
