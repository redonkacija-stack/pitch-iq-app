import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Flame,
  RotateCcw,
  X,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { varQuestions } from "../data/arcadeData";
import useRoomBotTurn from "../hooks/useRoomBotTurn";

export default function VarBlitzGame({ onBack, onComplete, room = null, activePlayerId = 0, turnDeadline = 0, onTurn, onScore }) {
  const [questions, setQuestions] = useState(() =>
    [...varQuestions].sort(() => Math.random() - 0.5),
  );
  const [seconds, setSeconds] = useState(60);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [totalDecisions, setTotalDecisions] = useState(0);

  const respond = useCallback(
    (answerValue) => {
      if (feedback || done) return;
      const currentQ = questions[index % questions.length];
      const hit = answerValue === currentQ.answer;

      setTotalDecisions((prev) => prev + 1);
      setFeedback({
        hit,
        explanation: currentQ.explanation,
        citation: currentQ.ruleCategory,
      });
      if (hit) onScore?.(activePlayerId, 20, true);
      onTurn?.((activePlayerId + 1) % (room?.capacity || 2), activePlayerId, "guess");

      if (hit) {
        const nextScore = score + 20;
        const nextStreak = streak + 1;
        setScore(nextScore);
        setStreak(nextStreak);
        setBestStreak((prev) => Math.max(prev, nextStreak));
      } else {
        setStreak(0);
      }

      setTimeout(() => {
        setFeedback(null);
        if (index + 1 >= questions.length || seconds <= 0) {
          setDone(true);
          onComplete?.(score + (hit ? 20 : 0), hit);
          if (score >= 100) {
            confetti({
              particleCount: 50,
              spread: 55,
              origin: { y: 0.6 },
            });
          }
        } else {
          setIndex((prev) => prev + 1);
        }
      }, 950);
    },
    [feedback, done, questions, index, score, streak, seconds, onComplete, onTurn, onScore, activePlayerId, room],
  );

  useRoomBotTurn({ room, activePlayerId, turnDeadline, turnKey: `${index}:${done}`, onAction: ({ accuracy }) => {
    if (!currentQ || done || feedback) return;
    const answer = Math.random() <= accuracy ? currentQ.answer : !currentQ.answer;
    respond(answer);
  } });

  // 60-second countdown timer
  useEffect(() => {
    if (done) return undefined;
    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [done]);

  // Keyboard shortcut listener: Left Arrow or '1' -> True, Right Arrow or '2' -> False
  useEffect(() => {
    function handleKeyDown(e) {
      if (done || feedback) return;
      if (e.key === "ArrowLeft" || e.key === "1") {
        respond(true);
      } else if (e.key === "ArrowRight" || e.key === "2") {
        respond(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [done, feedback, index, respond]);

  function reset() {
    setQuestions([...varQuestions].sort(() => Math.random() - 0.5));
    setSeconds(60);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalDecisions(0);
    setFeedback(null);
    setDone(false);
  }

  const currentQ = questions[index % questions.length];

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
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime"
            title="Restart & shuffle questions"
          >
            <RotateCcw size={13} className="text-lime" /> Shuffle Questions
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
            The VAR Call
          </span>
          <span className="text-xs text-slate-400">
            • 60-Second Referee Blitz
          </span>
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          High-Speed IFAB Rule Decisions
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Make rapid True or False refereeing calls before the 60-second review
          timer expires.
        </p>
      </div>

      {/* Screen Monitor Container */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 glass-surface p-6 sm:p-8">
        {/* Top Referee Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            </span>
            <span className="font-mono text-xs font-bold tracking-widest text-rose-400 uppercase">
              LIVE VAR REVIEW
            </span>
          </div>

          {/* 60s Clock */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm font-black tabular-nums transition ${
              seconds <= 10
                ? "border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse"
                : "border-white/10 bg-black/30 text-white"
            }`}
          >
            <Clock3 size={15} />
            <span>0:{String(seconds).padStart(2, "0")}</span>
          </div>

          {/* Streak Indicator */}
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <Flame
              size={15}
              className={streak > 0 ? "text-lime" : "text-slate-500"}
            />
            <span className="text-slate-400">Streak:</span>
            <span className="font-mono text-lime">{streak}</span>
          </div>
        </div>

        {done ? (
          /* End Game Scorecard */
          <div className="py-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-lime/30 bg-lime/10 text-lime">
              <Zap size={32} />
            </div>
            <h3 className="mt-4 font-display text-3xl font-black text-white">
              Full Time Review
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Decisions Made: {totalDecisions} • Accuracy:{" "}
              {totalDecisions > 0
                ? Math.round(((score / 20) / totalDecisions) * 100)
                : 0}
              %
            </p>

            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Final Score
              </div>
              <div className="font-display text-4xl font-black text-lime">
                {score} pts
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Highest Streak: {bestStreak} in a row
              </div>
            </div>

            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink shadow-lg shadow-lime/20 hover:bg-lime/90"
            >
              <RotateCcw size={14} /> Start Another 60s Blitz
            </button>
          </div>
        ) : (
          /* Active Question & Decision Controls */
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="rounded bg-black/30 px-2 py-1 font-mono text-[10px] font-semibold text-slate-400">
                {currentQ.ruleCategory || "IFAB Rulebook"}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Decision {index + 1} of {questions.length}
              </span>
            </div>

            {/* Incident Statement */}
            <h3 className="mt-4 min-h-24 font-display text-xl font-bold leading-relaxed text-white sm:text-2xl">
              "{currentQ.statement}"
            </h3>

            {/* Decision Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => respond(true)}
                disabled={Boolean(feedback)}
                className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 transition hover:border-emerald-500 hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                <Check
                  size={28}
                  className="text-emerald-400 transition group-hover:scale-110"
                />
                <span className="mt-2 font-display text-lg font-black uppercase tracking-wider text-emerald-300">
                  TRUE
                </span>
                <span className="text-[10px] text-emerald-400/70">
                  Press '1' or Left Arrow
                </span>
              </button>

              <button
                type="button"
                onClick={() => respond(false)}
                disabled={Boolean(feedback)}
                className="group flex flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 transition hover:border-rose-500 hover:bg-rose-500/20 active:scale-95 disabled:opacity-50"
              >
                <X
                  size={28}
                  className="text-rose-400 transition group-hover:scale-110"
                />
                <span className="mt-2 font-display text-lg font-black uppercase tracking-wider text-rose-300">
                  FALSE
                </span>
                <span className="text-[10px] text-rose-400/70">
                  Press '2' or Right Arrow
                </span>
              </button>
            </div>

            {/* Feedback Callout */}
            {feedback && (
              <div
                className={`animate-pop-in mt-5 rounded-xl border p-3.5 text-xs ${
                  feedback.hit
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                }`}
              >
                <p className="font-bold">
                  {feedback.hit ? "Correct Call!" : "Overruled!"}
                </p>
                <p className="mt-1 text-slate-300">{feedback.explanation}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <p className="text-center text-[10px] text-slate-500">
        All questions are vetted against the latest official IFAB Laws of the
        Game and UEFA/FIFA refereeing guidelines.
      </p>
    </div>
  );
}
