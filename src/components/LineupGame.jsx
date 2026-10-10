import { useEffect, useEffectEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Lightbulb,
  Search,
  Shield,
  Trophy,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import PitchCanvas from "./PitchCanvas";
import FlagIcon from "./FlagIcon";
import ClubCrest from "./ClubCrest";
import { useGame } from "../context/useGame";
import { useSound } from "../hooks/useSound";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function editDistance(left, right) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
}

export default function LineupGame({
  challenge,
  isDaily,
  onBack,
  onNext,
  onComplete,
  onProgress,
}) {
  const { stats } = useGame();
  const playSound = useSound(stats.soundEnabled);
  const [guessed, setGuessed] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [misses, setMisses] = useState(0);
  const [hints, setHints] = useState([]);
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(120);
  const [result, setResult] = useState(null);
  const players = challenge.players;
  const remaining = players.filter((player) => !guessed.has(player.id));
  const searchValue = normalize(query.trim());
  const options =
    searchValue.length < 2
      ? []
      : remaining
          .filter((player) => {
            const name = normalize(player.name);
            const surname = normalize(player.name.split(" ").at(-1));
            return (
              name.includes(searchValue) ||
              surname.startsWith(searchValue) ||
              (searchValue.length >= 4 &&
                Math.min(
                  editDistance(name, searchValue),
                  editDistance(surname, searchValue),
                ) <= (searchValue.length >= 7 ? 2 : 1))
            );
          })
          .slice(0, 5);

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
    const score = Math.max(
      0,
      guessed.size * 100 -
        misses * 15 -
        hints.length * 20 +
        Math.floor(seconds / 3),
    );
    setResult({ score, won });
    onComplete(score, won);
    if (won)
      confetti({
        particleCount: 75,
        spread: 62,
        origin: { y: 0.65 },
        colors: ["#22c55e", "#eaf7dd", "#4d9b70"],
      });
  }

  function reveal(id) {
    if (guessed.has(id) || result) return;
    const next = new Set(guessed);
    next.add(id);
    setGuessed(next);
    setSelectedId(null);
    setQuery("");
    setMessage("Correct. Added to the XI.");
    playSound("success");
    onProgress?.(next.size, players.length);
    if (next.size === players.length) {
      const score = Math.max(
        0,
        players.length * 100 -
          misses * 15 -
          hints.length * 20 +
          Math.floor(seconds / 3),
      );
      setResult({ score, won: true });
      onComplete(score, true);
      confetti({
        particleCount: 75,
        spread: 62,
        origin: { y: 0.65 },
        colors: ["#22c55e", "#eaf7dd", "#4d9b70"],
      });
    }
  }

  function submit(event) {
    event.preventDefault();
    if (!query.trim() || result) return;
    const target = selectedId
      ? remaining.find((player) => player.id === selectedId)
      : null;
    const match = remaining.find(
      (player) => normalize(player.name) === normalize(query.trim()),
    );
    if (match && (!target || target.id === match.id)) reveal(match.id);
    else {
      setMisses((count) => count + 1);
      setMessage(
        target
          ? `Not ${target.position}. Try another name.`
          : "Not in this XI. Try another name.",
      );
      playSound("error");
    }
  }

  function addHint(type) {
    if (hints.includes(type) || !remaining.length || result) return;
    const unresolved =
      remaining.find((player) => player.id === selectedId) || remaining[0];
    const clue =
      type === "initial"
        ? `${unresolved.position}: surname begins with “${unresolved.name.split(" ").at(-1).charAt(0)}”.`
        : `${unresolved.position}: previously played for ${unresolved.clubHint}.`;
    setHints((current) => [...current, type]);
    setMessage(clue);
    playSound("click");
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-5 sm:px-7 sm:pt-7 lg:px-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft size={14} /> Back to Modes
          </button>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-lime">
            <Shield size={13} /> Starting XI{" "}
            <span className="text-white/25">/</span> {challenge.formation}
          </p>
          <h1 className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">
            {challenge.title}
          </h1>
          <p className="mt-2 text-xs text-mist sm:text-sm">
            {challenge.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold tabular-nums ${seconds <= 20 ? "border-red-300/30 bg-red-400/10 text-red-200" : "border-white/10 bg-white/[.04] text-white"}`}
          >
            <Clock3 size={15} /> {Math.floor(seconds / 60)}:
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="Exit game"
          >
            <ArrowLeft size={14} /> Exit
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(310px,.75fr)]">
        <section className="glass-panel rounded-2xl p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <ClubCrest
                src={challenge.teamLogoUrl}
                alt={`${challenge.team} crest`}
                className="h-10 w-10 sm:h-12 sm:w-12"
                fallbackClassName="h-6 w-6"
              />
              <div>
                <p className="font-display text-lg font-bold uppercase">
                  {challenge.team}
                </p>
                <p className="text-[10px] uppercase tracking-[.15em] text-mist">
                  {challenge.subtitle.split("·").slice(1).join("·").trim()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-display text-sm font-bold uppercase text-mist">
                  {challenge.opponent}
                </p>
                <p className="text-[10px] uppercase tracking-[.15em] text-mist">
                  Opponent
                </p>
              </div>
              <ClubCrest
                src={challenge.opponentLogoUrl}
                alt={`${challenge.opponent} crest`}
                className="h-10 w-10 sm:h-12 sm:w-12"
                fallbackClassName="h-6 w-6"
              />
              <div className="text-right">
                <p className="font-display text-lg font-bold">
                  {guessed.size}
                  <span className="text-mist"> / 11</span>
                </p>
                <p className="text-[10px] uppercase tracking-[.15em] text-mist">
                  players found
                </p>
              </div>
            </div>
          </div>
          <PitchCanvas
            players={players}
            guessed={guessed}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedId(player.id)}
                disabled={guessed.has(player.id)}
                className={`flex min-h-12 items-center justify-between rounded-lg border px-3 text-left ${guessed.has(player.id) ? "border-lime/25 bg-lime/[.07]" : selectedId === player.id ? "border-lime/40 bg-lime/[.08]" : "border-white/10 bg-white/[.03] active:bg-white/[.08]"}`}
              >
                <span className="flex items-center gap-2">
                  <FlagIcon
                    code={player.nationalityCode}
                    label={`${player.name} nationality`}
                    className="h-4 w-6"
                  />
                  <span className="font-bold">#{player.number}</span>
                </span>
                <span className="ml-2 flex min-w-0 items-center justify-end gap-1.5 truncate text-right text-xs text-mist">
                  {guessed.has(player.id) && (
                    <ClubCrest
                      src={player.clubLogoUrl}
                      alt={`${challenge.team} crest`}
                      className="h-5 w-5"
                      fallbackClassName="h-3.5 w-3.5"
                    />
                  )}
                  <span className="truncate">
                    {guessed.has(player.id) ? player.name : player.position}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/[.07] bg-black/15 px-3 py-2">
            <span className="text-[11px] text-mist">
              {result
                ? challenge.result
                : "Select a position, then enter the player’s name."}
            </span>
            <span className="shrink-0 text-[10px] font-bold uppercase text-white/70">
              {challenge.formation}
            </span>
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          <section className="glass-panel rounded-2xl p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold uppercase">
                  Name that player
                </p>
                <p className="mt-1 text-xs text-mist">
                  Try a surname or use the suggestions.
                </p>
              </div>
              <span className="rounded-md bg-lime/10 px-2 py-1 text-xs font-bold text-lime">
                {guessed.size}/11
              </span>
            </div>
            <form onSubmit={submit} className="relative">
              <div className="flex rounded-lg border border-white/10 bg-black/20 transition focus-within:border-lime/50">
                <Search size={16} className="ml-3 mt-3.5 shrink-0 text-mist" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search player name..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  autoComplete="off"
                  aria-label="Search player name"
                />
                <button className="m-1 rounded-md bg-lime px-3 text-xs font-bold text-ink transition hover:bg-[#4ade80]">
                  Enter
                </button>
              </div>
              {options.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#172338] shadow-xl">
                  {options.map((player) => (
                    <button
                      type="button"
                      key={player.id}
                      onClick={() => {
                        setQuery(player.name);
                        setSelectedId(player.id);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-lime/10"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FlagIcon
                          code={player.nationalityCode}
                          label={`${player.name} nationality`}
                          className="h-4 w-6"
                        />
                        <span className="truncate">{player.name}</span>
                      </span>
                      <span className="ml-3 text-xs text-mist">
                        {player.position}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </form>
            <div className="mt-3 flex min-h-9 items-center gap-2 text-xs">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full ${message.startsWith("Correct") ? "bg-lime/15 text-lime" : message.startsWith("Not") ? "bg-red-300/10 text-red-200" : "bg-white/[.06] text-mist"}`}
              >
                {message.startsWith("Correct") ? (
                  <Check size={12} />
                ) : message.startsWith("Not") ? (
                  <X size={12} />
                ) : (
                  <Lightbulb size={12} />
                )}
              </span>
              <span className="text-mist">
                {message || "Your guesses and hints shape your score."}
              </span>
            </div>
          </section>
          <section className="glass-panel rounded-2xl p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-xl font-bold uppercase">
                Clue board
              </p>
              <Lightbulb size={16} className="text-lime" />
            </div>
            <p className="mb-3 text-xs text-mist">
              Reveal a clue for the selected or next unknown player. Each clue
              costs 20 points.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addHint("initial")}
                disabled={hints.includes("initial") || !remaining.length}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-2 py-2.5 text-xs font-semibold transition hover:border-lime/30 disabled:opacity-40"
              >
                <Lightbulb size={14} /> Surname initial
              </button>
              <button
                onClick={() => addHint("club")}
                disabled={hints.includes("club") || !remaining.length}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-2 py-2.5 text-xs font-semibold transition hover:border-lime/30 disabled:opacity-40"
              >
                <Shield size={14} /> Former club
              </button>
            </div>
            {hints.length > 0 && (
              <p className="mt-3 text-[10px] text-mist">
                Clues used: {hints.length}
              </p>
            )}
          </section>
          {result ? (
            <section className="animate-pop-in rounded-2xl border border-lime/20 bg-lime/[.08] p-5">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-lime" />
                <div>
                  <p className="font-display text-2xl font-bold uppercase">
                    {result.won ? "Full house" : "Round complete"}
                  </p>
                  <p className="text-xs text-mist">
                    {result.score} points added to your record.
                  </p>
                </div>
              </div>
              <button
                onClick={isDaily ? onNext : onBack}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-2.5 text-sm font-bold text-ink transition hover:bg-[#4ade80]"
              >
                {isDaily ? "Continue daily set" : "Back to hub"}{" "}
                <ArrowRight size={15} />
              </button>
            </section>
          ) : (
            <section className="rounded-xl border border-white/[.07] bg-white/[.025] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-mist">
                    Round score
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold">
                    {Math.max(
                      0,
                      guessed.size * 100 - misses * 15 - hints.length * 20,
                    )}
                    <span className="ml-1 text-sm text-mist">PTS</span>
                  </p>
                </div>
                <button
                  onClick={() => finishRound(false)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-mist transition hover:border-white/30 hover:text-white"
                >
                  Finish round
                </button>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-lime transition-all"
                  style={{ width: `${(guessed.size / players.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-mist">
                {misses} incorrect {misses === 1 ? "guess" : "guesses"} ·{" "}
                {hints.length} clues used
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
