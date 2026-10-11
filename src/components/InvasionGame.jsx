import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Crown,
  Gamepad2,
  Hash,
  Plus,
  RotateCcw,
  Shield,
  Swords,
  Users,
  X,
} from "lucide-react";
import { invasionPlayers, invasionTiers } from "../data/invasionData";

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const POINT_CLASS = ["text-emerald-200", "text-amber-200", "text-rose-200"];

function normalizeRoomCode(value) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.startsWith("INV")) return `INV-${clean.slice(3, 7)}`;
  return `INV-${clean.slice(0, 4)}`;
}

function normalizeAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function seededOrder(roomCode) {
  let seed = 2166136261;
  for (const character of roomCode) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619) >>> 0;
  }
  const next = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const shuffled = [...invasionPlayers];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

function createRoomCode() {
  const bytes = new Uint8Array(4);
  if (globalThis.crypto?.getRandomValues)
    globalThis.crypto.getRandomValues(bytes);
  else
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
  return `INV-${Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join("")}`;
}

export default function InvasionGame({ onBack }) {
  const [roomCode, setRoomCode] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [roomError, setRoomError] = useState("");
  const [phase, setPhase] = useState("lobby");
  const [turn, setTurn] = useState(0);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [tierIndex, setTierIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [scores, setScores] = useState([0, 0]);
  const [guessedCounts, setGuessedCounts] = useState([0, 0]);
  const [feedback, setFeedback] = useState(null);
  const [lastEvent, setLastEvent] = useState(
    "Create a room or enter a code to set the player sequence.",
  );
  const [copied, setCopied] = useState(false);

  const playerPool = useMemo(
    () => (roomCode ? seededOrder(roomCode) : []),
    [roomCode],
  );
  const activePlayer = playerPool[playerIndex];
  const tier = invasionTiers[tierIndex];
  const question = activePlayer?.tiers[tierIndex];
  const gameOver = playerIndex >= playerPool.length;

  function startRoom(code) {
    const normalized = normalizeRoomCode(code);
    if (!/^INV-[A-Z0-9]{4}$/.test(normalized)) {
      setRoomError("Room codes use the format INV-AB12.");
      return;
    }
    setRoomCode(normalized);
    setRoomError("");
    setPhase("playing");
    setTurn(0);
    setPlayerIndex(0);
    setTierIndex(0);
    setAnswerInput("");
    setScores([0, 0]);
    setGuessedCounts([0, 0]);
    setFeedback(null);
    setLastEvent(`Room ${normalized} opened. You have the first turn.`);
  }

  function createRoom() {
    const code = createRoomCode();
    setRoomInput(code);
    startRoom(code);
  }

  function joinRoom(event) {
    event.preventDefault();
    startRoom(roomInput);
  }

  function advancePlayer(completingPlayer) {
    setGuessedCounts((current) =>
      current.map(
        (count, index) => count + (index === completingPlayer ? 1 : 0),
      ),
    );
    setPlayerIndex((current) => current + 1);
    setTierIndex(0);
    setAnswerInput("");
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (!question || !answerInput.trim()) return;
    const supplied = normalizeAnswer(answerInput);
    const acceptedAnswers = [question.answer, ...(question.accepted || [])].map(
      normalizeAnswer,
    );
    if (acceptedAnswers.includes(supplied)) {
      setScores((current) =>
        current.map(
          (score, index) => score + (index === turn ? tier.points : 0),
        ),
      );
      setFeedback({
        correct: true,
        text: `Correct. ${tier.points} points to Player ${turn + 1}.`,
        answer: question.answer,
      });
      setLastEvent(
        `Player ${turn + 1} identified ${activePlayer.name} · ${tier.label} tier.`,
      );
      setAnswerInput("");
      if (tierIndex === 2) advancePlayer(turn);
      else setTierIndex((current) => current + 1);
    } else {
      setFeedback({
        correct: false,
        text: `Not quite. The same clue passes to Player ${turn === 0 ? 2 : 1}.`,
        answer: question.answer,
      });
      setLastEvent(
        `Player ${turn + 1} missed the ${tier.label} question. The turn changed.`,
      );
      setAnswerInput("");
    }
    setTurn((current) => (current === 0 ? 1 : 0));
  }

  function copyCode() {
    navigator.clipboard
      ?.writeText(roomCode)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => setCopied(false));
  }

  function resetMatch() {
    setPhase("lobby");
    setRoomCode("");
    setRoomInput("");
    setFeedback(null);
    setLastEvent("Create a room or enter a code to set the player sequence.");
  }

  const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;

  return (
    <div className="mx-auto w-full max-w-[1250px] space-y-6 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={14} /> Back to overview
          </button>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200">
            <Swords size={14} /> Head-to-head / Football Invasion
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            Know the player. Take the points.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            A turn-based football quiz using a room-code-seeded player pool from
            the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Each
            player has three escalating clues.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-amber-200/[.04] px-3 py-1.5 text-[10px] font-semibold text-amber-100">
          <Users size={13} /> Local pass-and-play
        </span>
      </div>

      {phase === "lobby" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <section className="relative overflow-hidden rounded-2xl border border-white/[.08] glass-surface p-5 sm:p-8">
            <div className="absolute -right-8 -top-12 h-60 w-60 rounded-full border border-emerald-200/[.06]" />
            <div className="relative max-w-2xl">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
                <Gamepad2 size={22} />
              </span>
              <h3 className="mt-5 font-display text-3xl font-bold">
                Set up your match
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
                Create a code for a local head-to-head, or join with a code. The
                same code always shuffles the same 15-player set, so players
                entering the same code see identical order.
              </p>
              <button
                onClick={createRoom}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200"
              >
                <Plus size={16} /> Create room <ArrowRight size={16} />
              </button>
              <div className="mt-7 border-t border-white/[.07] pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                  Join a room
                </p>
                <form onSubmit={joinRoom} className="mt-2 flex max-w-md gap-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-3 focus-within:border-emerald-200/40">
                    <Hash size={15} className="shrink-0 text-slate-500" />
                    <input
                      value={roomInput}
                      onChange={(event) =>
                        setRoomInput(event.target.value.toUpperCase())
                      }
                      placeholder="INV-8X2A"
                      maxLength={8}
                      className="min-w-0 flex-1 bg-transparent py-3 font-mono text-sm tracking-[.12em] text-white outline-none placeholder:text-slate-600"
                      aria-label="Room code"
                    />
                  </label>
                  <button className="rounded-lg border border-white/10 px-4 text-xs font-bold text-slate-200 transition hover:bg-white/[.06]">
                    Join
                  </button>
                </form>
                {roomError && (
                  <p role="alert" className="mt-2 text-xs text-rose-200">
                    {roomError}
                  </p>
                )}
              </div>
            </div>
          </section>
          <aside className="space-y-3 rounded-2xl border border-white/[.08] glass-surface p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
              Three-round progression
            </p>
            {invasionTiers.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-white/[.06] bg-black/10 p-3"
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-md bg-white/[.05] font-display text-sm font-bold ${POINT_CLASS[index]}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-[10px] text-slate-500">
                    {index === 0
                      ? "Club, position, or nation"
                      : index === 1
                        ? "Career moves and background"
                        : "International and tournament facts"}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-300">
                  +{item.points}
                </span>
              </div>
            ))}
            <p className="border-t border-white/[.07] pt-3 text-[10px] leading-relaxed text-slate-500">
              Dataset is a curated 2024–25 season snapshot. This build is local
              pass-and-play; room codes sync the puzzle order but do not connect
              separate devices.
            </p>
          </aside>
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-white/[.08] glass-surface">
            <div className="grid sm:grid-cols-2">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between gap-3 p-4 sm:p-5 ${index === 1 ? "border-t border-white/[.07] sm:border-l sm:border-t-0" : ""} ${turn === index && !gameOver ? "bg-emerald-200/[.045]" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${turn === index && !gameOver ? "bg-emerald-200/10 text-emerald-100" : "bg-white/[.05] text-slate-400"}`}
                    >
                      <Users size={17} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">
                          Player {index + 1}{" "}
                          {index === 0 ? "(You)" : "(Opponent)"}
                        </p>
                        {turn === index && !gameOver && (
                          <span className="rounded-full bg-emerald-200/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-100">
                            Turn
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Guessed: {guessedCounts[index]} players
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-bold tabular-nums">
                      {scores[index]}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-500">
                      points
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[.07] bg-black/10 px-4 py-3 text-[10px]">
              <span className="inline-flex items-center gap-2 text-slate-400">
                <Hash size={12} className="text-emerald-200" /> Room{" "}
                <b className="font-mono tracking-[.12em] text-white">
                  {roomCode}
                </b>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-slate-500 hover:bg-white/[.06] hover:text-white"
                  aria-label="Copy room code"
                >
                  <Copy size={12} />
                  {copied ? "Copied" : ""}
                </button>
              </span>
              <span className="text-slate-500">
                Player pool seeded from room code · {playerPool.length} players
              </span>
              <button
                onClick={resetMatch}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-slate-500 transition hover:text-white"
              >
                <RotateCcw size={12} /> New room
              </button>
            </div>
          </section>

          {gameOver ? (
            <section className="mx-auto max-w-xl rounded-2xl border border-emerald-200/20 bg-emerald-200/[.05] p-7 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-200/10 text-emerald-100">
                <Crown size={23} />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200">
                Full time
              </p>
              <h3 className="mt-1 font-display text-3xl font-bold">
                {winner === null
                  ? "Level on points"
                  : `Player ${winner + 1} wins`}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {scores[0]} – {scores[1]} · {playerPool.length} players
                completed
              </p>
              <button
                onClick={resetMatch}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-200"
              >
                <RotateCcw size={14} /> Play again
              </button>
            </section>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
              <section className="relative overflow-hidden rounded-2xl border border-white/[.08] glass-surface p-5 sm:p-7">
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/[.08] bg-black/10 px-2.5 py-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${tierIndex === 0 ? "bg-emerald-300" : tierIndex === 1 ? "bg-amber-200" : "bg-rose-200"}`}
                  />
                  <span
                    className={`text-[9px] font-bold uppercase tracking-[.13em] ${POINT_CLASS[tierIndex]}`}
                  >
                    {tier.label} · +{tier.points}
                  </span>
                </div>
                <div className="mt-2 flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[.05] font-display text-lg font-bold text-slate-300">
                    {String(playerIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">
                      Mystery player / {activePlayer.league}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-bold">
                      Identify the player
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Tier {tierIndex + 1} of 3 · one correct answer advances
                      the clue
                    </p>
                  </div>
                </div>
                <div className="mt-7 rounded-xl border border-emerald-200/10 bg-slate-950/80 p-5 sm:p-7">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CircleHelp size={17} />
                    <span className="text-[10px] font-bold uppercase tracking-[.13em]">
                      {tier.label} clue
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl font-display text-2xl font-semibold leading-snug sm:text-3xl">
                    {question.question}
                  </p>
                  <form
                    onSubmit={submitAnswer}
                    className="mt-6 flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      value={answerInput}
                      onChange={(event) => setAnswerInput(event.target.value)}
                      placeholder="Type your answer..."
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/75 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-200/40"
                      aria-label="Answer"
                      autoComplete="off"
                    />
                    <button
                      disabled={!answerInput.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Lock answer <ArrowRight size={14} />
                    </button>
                  </form>
                  {feedback && (
                    <div
                      className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed ${feedback.correct ? "feedback-correct border-emerald-400/30 bg-emerald-400/[.06] text-emerald-100" : "feedback-wrong border-rose-400/30 bg-rose-400/[.06] text-rose-100"}`}
                    >
                      <span className="mt-0.5">
                        {feedback.correct ? (
                          <Check size={14} />
                        ) : (
                          <X size={14} />
                        )}
                      </span>
                      <span>{feedback.text}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                  <Shield size={13} className="text-slate-600" /> Correct
                  answers advance the shared player; a miss passes the same clue
                  to the other player.
                </div>
              </section>
              <aside className="space-y-4">
                <section className="rounded-2xl border border-white/[.08] glass-surface p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                    Progress this match
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="font-display text-3xl font-bold">
                        {playerIndex}
                        <span className="text-lg text-slate-600">
                          /{playerPool.length}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Players completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-3xl font-bold">
                        {tierIndex + 1}
                        <span className="text-lg text-slate-600">/3</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Current player tier
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                    <div
                      className="h-full rounded-full bg-emerald-300 transition-all"
                      style={{
                        width: `${((playerIndex + tierIndex / 3) / playerPool.length) * 100}%`,
                      }}
                    />
                  </div>
                </section>
                <section className="rounded-2xl border border-white/[.08] glass-surface p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                    Match activity
                  </p>
                  <p className="mt-3 min-h-[48px] text-xs leading-relaxed text-slate-300">
                    {lastEvent}
                  </p>
                  <div className="mt-4 flex gap-1.5">
                    {invasionTiers.map((item, index) => (
                      <span
                        key={item.label}
                        className={`h-1.5 flex-1 rounded-full ${index <= tierIndex ? (index === 0 ? "bg-emerald-300/80" : index === 1 ? "bg-amber-200/80" : "bg-rose-200/80") : "bg-white/[.07]"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[9px] text-slate-600">
                    The same deterministic question sequence is generated for
                    this room code.
                  </p>
                </section>
                <button
                  onClick={() => {
                    setTurn((current) => (current === 0 ? 1 : 0));
                    setLastEvent(
                      `Turn manually passed to Player ${turn === 0 ? 2 : 1}.`,
                    );
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:text-white"
                >
                  Pass turn <ChevronRight size={14} />
                </button>
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
}
