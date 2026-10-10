import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  Play,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Navbar from "./components/Navbar";
import LineupGame from "./components/LineupGame";
import TransferGame from "./components/TransferGame";
import TacticsGame from "./components/TacticsGame";
import StatsModal from "./components/StatsModal";
import { GameProvider } from "./context/GameContext";
import { useGame } from "./context/useGame";
import { getDailySet } from "./data/daily";
import { careers, matches, profiles } from "./data/gameData";
import "./index.css";

const modeInfo = {
  lineup: {
    title: "Starting XI",
    subtitle: "Every number has a name.",
    icon: Shield,
    color: "from-lime/20 to-lime/5",
    label: "LINEUP",
  },
  transfer: {
    title: "Career path",
    subtitle: "Connect the clubs. Name the player.",
    icon: ArrowRight,
    color: "from-cyan-300/20 to-cyan-300/5",
    label: "TRANSFER CHAIN",
  },
  tactics: {
    title: "Tactical ID",
    subtitle: "Read the game behind the game.",
    icon: CircleHelp,
    color: "from-orange-300/20 to-orange-300/5",
    label: "TACTICAL BREAKDOWN",
  },
};
const dailyOrder = ["lineup", "transfer", "tactics"];

function Dashboard({ onPlay, stats, dailySet, onStats }) {
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dailySet.date}T00:00:00.000Z`));
  const completed = stats.dailyProgress[dailySet.date] || [];
  const dailyDone = completed.length === 3;
  const quickStats = [
    {
      label: "Current streak",
      value: `${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`,
      icon: Flame,
      tint: "text-orange-300",
    },
    {
      label: "Best streak",
      value: `${stats.bestStreak} days`,
      icon: Trophy,
      tint: "text-lime",
    },
    {
      label: "Win rate",
      value: `${stats.totalGames ? Math.round((stats.wins / stats.totalGames) * 100) : 0}%`,
      icon: Zap,
      tint: "text-cyan-200",
    },
    {
      label: "Total points",
      value: stats.totalPoints.toLocaleString(),
      icon: Award,
      tint: "text-yellow-200",
    },
  ];
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-7 sm:px-7 lg:px-10 lg:pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-fade-in">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-lime">
            <CalendarDays size={14} /> {dateLabel}
          </p>
          <h1 className="font-display text-[42px] font-bold uppercase leading-none tracking-[0] sm:text-5xl">
            Read the game.
            <br className="sm:hidden" />{" "}
            <span className="text-lime">Own the details.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-mist">
            A daily test for the football-obsessed. Three ways to prove what you
            know.
          </p>
        </div>
        <button
          onClick={onStats}
          className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-lime/40 hover:bg-white/[.07] sm:flex"
        >
          <Award size={17} className="text-lime" /> Achievements{" "}
          <ChevronRight size={15} className="text-mist" />
        </button>
      </div>
      <section className="relative mb-7 overflow-hidden rounded-2xl border border-lime/20 bg-[#172338] p-5 sm:p-7">
        <div className="absolute inset-y-0 right-0 hidden w-[45%] opacity-40 md:block">
          <div className="absolute inset-0 bg-gradient-to-r from-[#172338] via-[#172338]/50 to-transparent" />
          <div className="absolute -right-10 -top-16 h-80 w-80 rounded-full border border-lime/20" />
          <div className="absolute right-4 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-lime/20" />
          <div className="absolute right-28 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-lime shadow-glow" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-lime">
              <Sparkles size={15} /> The daily three
            </p>
            <h2 className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">
              One day. Three disciplines.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Today’s set is locked in. Take on a Champions League XI, trace a
              legend’s career, and decode a tactical identity.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(modeInfo).map(([key, mode]) => {
                const Icon = mode.icon;
                const isDone = completed.includes(key);
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${isDone ? "border-lime/30 bg-lime/10 text-lime" : "border-white/10 bg-black/15 text-white/75"}`}
                  >
                    <Icon size={13} /> {mode.title} {isDone ? "· DONE" : ""}
                  </span>
                );
              })}
            </div>
          </div>
          <button
            disabled={dailyDone}
            onClick={() => onPlay("lineup", true)}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-lime px-5 py-3 text-sm font-bold text-ink transition hover:scale-[1.02] hover:bg-[#4ade80] disabled:cursor-default disabled:opacity-60 disabled:hover:scale-100"
          >
            {dailyDone ? (
              <Check size={16} />
            ) : (
              <Play size={16} fill="currentColor" />
            )}{" "}
            {dailyDone
              ? "Daily set complete"
              : completed.length
                ? "Continue today’s set"
                : "Start today’s set"}{" "}
            {!dailyDone && (
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            )}
          </button>
        </div>
      </section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold uppercase">
          Pick your test
        </h2>
        <span className="text-xs text-mist">
          Best played with your football brain switched on
        </span>
      </div>
      <section className="grid gap-3 md:grid-cols-3">
        {Object.entries(modeInfo).map(([key, mode], index) => {
          const Icon = mode.icon;
          return (
            <button
              key={key}
              onClick={() => onPlay(key, false)}
              className="group relative min-h-[190px] overflow-hidden rounded-xl border border-white/[.09] bg-panel p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-[#1e293b] animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className={`absolute -right-4 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${mode.color} blur-2xl transition group-hover:scale-150`}
              />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="rounded-md border border-white/10 bg-black/20 p-2.5">
                    <Icon
                      size={19}
                      className={
                        key === "lineup"
                          ? "text-lime"
                          : key === "transfer"
                            ? "text-cyan-200"
                            : "text-orange-200"
                      }
                    />
                  </span>
                  <span className="font-display text-xs font-bold uppercase tracking-[.13em] text-mist">
                    0{index + 1} / {mode.label}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase">
                    {mode.title}
                  </h3>
                  <p className="mt-1 text-sm text-mist">{mode.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-lime">
                    Play mode{" "}
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map(({ label, value, icon: Icon, tint }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-white/[.07] bg-white/[.025] px-4 py-4"
          >
            <span className={`rounded-lg bg-white/[.05] p-2.5 ${tint}`}>
              <Icon size={18} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-mist">
                {label}
              </p>
              <p className="mt-0.5 font-display text-2xl font-bold uppercase leading-none">
                {value}
              </p>
            </div>
          </div>
        ))}
      </section>
      <button
        onClick={onStats}
        className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-mist transition hover:text-lime sm:hidden"
      >
        <Award size={15} /> View achievements <ChevronRight size={14} />
      </button>
      <p className="mt-8 flex items-center gap-2 text-[11px] text-mist/75">
        <Clock3 size={13} /> Daily puzzles reset at midnight UTC{" "}
        <span className="mx-1 text-white/20">·</span> Progress saves on this
        device
      </p>
    </div>
  );
}

function GameScreen({
  activeMode,
  challenge,
  isDaily,
  onBack,
  onNext,
  onComplete,
}) {
  const shared = { challenge, isDaily, onBack, onNext, onComplete };
  if (activeMode === "lineup")
    return <LineupGame key={challenge.id} {...shared} />;
  if (activeMode === "transfer")
    return <TransferGame key={challenge.id} {...shared} />;
  return <TacticsGame key={challenge.id} {...shared} />;
}

function AppContent() {
  const { stats, recordRound, setSoundEnabled } = useGame();
  const [activeMode, setActiveMode] = useState("home");
  const [isDaily, setIsDaily] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [dailyQueue, setDailyQueue] = useState([]);
  const [dailyPosition, setDailyPosition] = useState(0);
  const [dailySet] = useState(() => getDailySet());

  function startGame(mode, daily) {
    if (daily) {
      const completed = stats.dailyProgress[dailySet.date] || [];
      const queue = dailyOrder.filter((item) => !completed.includes(item));
      if (!queue.length) return;
      setDailyQueue(queue);
      setDailyPosition(0);
      mode = queue[0];
    }
    const data =
      mode === "lineup" ? matches : mode === "transfer" ? careers : profiles;
    setChallenge(
      daily ? dailySet[mode] : data[Math.floor(Math.random() * data.length)],
    );
    setIsDaily(daily);
    setActiveMode(mode);
  }

  function nextDaily() {
    const position = dailyPosition + 1;
    if (position >= dailyQueue.length) {
      setActiveMode("home");
      return;
    }
    const mode = dailyQueue[position];
    setDailyPosition(position);
    setChallenge(dailySet[mode]);
    setActiveMode(mode);
  }

  function finishGame(mode, score, won) {
    recordRound(mode, score, won, isDaily, dailySet.date);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="pointer-events-none fixed inset-0 noise-bg opacity-[.025]" />
      <Navbar
        activeMode={activeMode}
        soundEnabled={stats.soundEnabled}
        onHome={() => setActiveMode("home")}
        onSelectMode={(mode) => startGame(mode, false)}
        onStats={() => setShowStats(true)}
        onSoundChange={setSoundEnabled}
      />
      <main className="relative z-10">
        {activeMode === "home" ? (
          <Dashboard
            onPlay={startGame}
            stats={stats}
            dailySet={dailySet}
            onStats={() => setShowStats(true)}
          />
        ) : (
          <>
            <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 pt-5 sm:px-7 lg:px-10">
              <button
                onClick={() => setActiveMode("home")}
                className="inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm font-semibold text-mist transition hover:text-white"
              >
                <ArrowLeft size={16} /> Hub
              </button>
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] ${isDaily ? "border-lime/25 bg-lime/10 text-lime" : "border-white/10 bg-white/[.04] text-mist"}`}
              >
                {isDaily ? "Daily challenge" : "Practice round"}
              </span>
            </div>
            {challenge && (
              <GameScreen
                activeMode={activeMode}
                challenge={challenge}
                isDaily={isDaily}
                onBack={() => setActiveMode("home")}
                onNext={nextDaily}
                onComplete={(score, won) => finishGame(activeMode, score, won)}
              />
            )}
          </>
        )}
      </main>
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />
      <footer className="relative z-10 mx-auto flex max-w-[1280px] items-center justify-between border-t border-white/[.06] px-4 py-4 text-[10px] uppercase tracking-[.13em] text-mist/60 sm:px-7 lg:px-10">
        <span>
          PitchIQ <span className="text-lime">/</span> Football intelligence, in
          play
        </span>
        <span>Built for the detail people</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
