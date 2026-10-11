import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Crown,
  Hash,
  RotateCcw,
  X,
} from "lucide-react";
import { invasionPlayers, invasionTiers } from "../data/invasionData";

function makePool(code) {
  let seed = 2166136261;
  for (const char of code)
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const result = [...invasionPlayers];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export default function RoomInvasionGame({ room, onBack, onComplete, onScore, onTurn }) {
  const seats = room?.format === "2v2" ? 4 : 2;
  const pool = useMemo(
    () => makePool(room?.code || "PITCH-DEMO"),
    [room?.code],
  );
  const [turn, setTurn] = useState(0);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [tierIndex, setTierIndex] = useState(0);
  const [scores, setScores] = useState(() => Array(seats).fill(0));
  const [guessed, setGuessed] = useState(() => Array(seats).fill(0));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [event, setEvent] = useState(
    `Room ${room?.code} is ready. ${room?.slots?.[0]?.name || "Player 1"} has the first turn.`,
  );
  const done = playerIndex >= pool.length;
  const current = pool[playerIndex];
  const tier = invasionTiers[tierIndex];
  const question = current?.tiers[tierIndex];
  const teamScores =
    seats === 4 ? [scores[0] + scores[2], scores[1] + scores[3]] : scores;
  const winner =
    teamScores[0] === teamScores[1]
      ? null
      : teamScores[0] > teamScores[1]
        ? 0
        : 1;
  const seatName = (slot) => room?.slots?.[slot]?.name || `Player ${slot + 1}`;

  function submitAnswer(value) {
    if (!question || !value.trim() || done) return;
    const expected = [question.answer, ...(question.accepted || [])].map(
      normalize,
    );
    const correct = expected.includes(normalize(value));
    const nextTurn = (turn + 1) % seats;
    onTurn?.(nextTurn);
    setAnswer("");
    setTurn(nextTurn);
    if (!correct) {
      setFeedback({
        correct: false,
        text: `Incorrect. The clue passes to ${seatName(nextTurn)}.`,
      });
      setEvent(
        `${seatName(turn)} missed the ${tier.label} clue; ${seatName(nextTurn)} is up.`,
      );
      return;
    }
    const points = tier.points;
    onScore?.(turn, points, tierIndex === 2);
    setScores((previous) =>
      previous.map((value, slot) => value + (slot === turn ? points : 0)),
    );
    setFeedback({
      correct: true,
      text: `Correct. ${points} points for ${seatName(turn)}.`,
    });
    setEvent(
      `${seatName(turn)} identified ${current.name} on the ${tier.label} clue.`,
    );
    if (tierIndex === 2) {
      setGuessed((previous) =>
        previous.map((value, slot) => value + (slot === turn ? 1 : 0)),
      );
      setPlayerIndex((value) => value + 1);
      setTierIndex(0);
      if (playerIndex + 1 === pool.length) onComplete?.(points, true);
    } else setTierIndex((value) => value + 1);
  }

  function submit(eventObject) {
    eventObject.preventDefault();
    submitAnswer(answer);
  }

  // Bots guess on their own turns after a short, difficulty-weighted delay.
  useEffect(() => {
    if (done || room?.localSlot !== 0 || !room?.slots?.[turn]?.isBot || !question) return undefined;
    const bot = room.slots[turn];
    const accuracy = {
      Easy: 0.32,
      Medium: 0.58,
      Hard: 0.82,
    }[bot.botDifficulty] || 0.5;
    const delay = 4000 + Math.random() * 4000 + (bot.botDifficulty === "Easy" ? 900 : 0);
    const timerId = setTimeout(() => {
      submitAnswer(Math.random() < accuracy ? question.answer : "Unknown Player");
    }, delay);
    return () => clearTimeout(timerId);
  }, [done, room, turn, playerIndex, tierIndex, question]);

  function reset() {
    setTurn(0);
    setPlayerIndex(0);
    setTierIndex(0);
    setScores(Array(seats).fill(0));
    setGuessed(Array(seats).fill(0));
    setFeedback(null);
    setAnswer("");
    setEvent(`Room ${room?.code} is ready. ${seatName(0)} has the first turn.`);
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 px-4 py-6 sm:px-7 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white"
          >
            <ArrowLeft size={14} /> Match lobby
          </button>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">
            Football Invasion / {room?.format || "1v1"}
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold">
            Know the player. Take the points.
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-slate-300">
          <Hash size={13} />
          {room?.code}
        </span>
      </div>
      <section className="overflow-hidden rounded-xl border border-white/[.08] bg-panel">
        <div
          className={`grid ${seats === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}
        >
          {Array.from({ length: seats }, (_, slot) => (
            <div
              key={slot}
              className={`flex items-center justify-between border-white/[.06] p-4 ${slot > 0 ? "border-t sm:border-t-0" : ""} ${seats === 4 && slot > 1 ? "sm:border-t" : ""} ${seats === 4 && slot % 2 === 1 ? "sm:border-l" : ""} ${turn === slot && !done ? "bg-lime/[.035]" : ""}`}
            >
              <div>
                <p className="text-sm font-bold">
                  {seatName(slot)}{" "}
                  <span className="text-[9px] font-normal text-slate-500">
                    · Team {slot % 2 === 0 ? "A" : "B"}
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Guessed {guessed[slot]} players
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold">
                  {scores[slot]}
                </p>
                <p className="text-[9px] uppercase text-slate-500">points</p>
              </div>
            </div>
          ))}
        </div>
        {seats === 4 && (
          <div className="flex justify-between border-t border-white/[.07] px-4 py-2 text-[10px] font-bold">
            <span className="text-emerald-200">
              Team A total · {teamScores[0]}
            </span>
            <span className="text-sky-200">Team B total · {teamScores[1]}</span>
          </div>
        )}
      </section>
      {done ? (
        <section className="rounded-2xl border border-lime/20 bg-panel p-8 text-center">
          <Crown className="mx-auto text-lime" size={32} />
          <h3 className="mt-3 font-display text-3xl font-bold">
            {winner === null
              ? "Draw game"
              : seats === 4
                ? `Team ${winner === 0 ? "A" : "B"} wins`
                : `${seatName(winner)} wins`}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {seats === 4
              ? `Team A ${teamScores[0]} – Team B ${teamScores[1]}`
              : `${scores[0]} – ${scores[1]}`}{" "}
            · {pool.length} players
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-xs font-bold text-ink"
            >
              <RotateCcw size={14} /> Rematch
            </button>
            <button
              onClick={onBack}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold"
            >
              Lobby
            </button>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-white/[.08] bg-panel p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
                  Mystery player / {current.league}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold">
                  Player {playerIndex + 1} of {pool.length}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {seatName(turn)} · clue {tierIndex + 1} / 3
                </p>
              </div>
              <span className="rounded-full border border-lime/20 px-3 py-1 text-[10px] font-bold uppercase text-lime">
                {tier.label} · +{tier.points}
              </span>
            </div>
            <div className="mt-6 rounded-xl border border-white/[.07] bg-[#0c1424] p-5">
              <div className="flex items-center gap-2 text-lime">
                <CircleHelp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Question
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold">
                {question.question}
              </p>
              <form
                onSubmit={submit}
                className="mt-5 flex flex-col gap-2 sm:flex-row"
              >
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#111c2e] px-3 py-3 text-sm outline-none focus:border-lime/40"
                />
                <button
                  disabled={!answer.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime px-4 py-3 text-xs font-bold text-ink disabled:opacity-40"
                >
                  Lock answer <ArrowRight size={14} />
                </button>
              </form>
              {feedback && (
                <p
                  className={`mt-3 flex items-center gap-2 rounded-lg border p-3 text-xs ${feedback.correct ? "border-emerald-200/15 text-emerald-100" : "border-amber-200/15 text-amber-100"}`}
                >
                  {feedback.correct ? <Check size={14} /> : <X size={14} />}{" "}
                  {feedback.text}
                </p>
              )}
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              Room state is local pass-and-play. Room code deterministically
              seeds the same player order.
            </p>
          </section>
          <aside className="space-y-4">
            <section className="rounded-xl border border-white/[.08] bg-panel p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Match progress
              </p>
              <p className="mt-2 font-display text-3xl font-bold">
                {playerIndex}
                <span className="text-lg text-slate-600">/{pool.length}</span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-lime transition-all"
                  style={{
                    width: `${((playerIndex + tierIndex / 3) / pool.length) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">{event}</p>
            </section>
            <button
              onClick={() => setTurn((value) => (value + 1) % seats)}
              className="w-full rounded-lg border border-white/10 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Pass turn
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
