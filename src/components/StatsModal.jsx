import { useState } from "react";
import {
  Award,
  Flame,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";

const awards = [
  {
    id: "first-game",
    title: "First whistle",
    description: "Play your first round",
    icon: Shield,
    unlocked: (stats) => stats.totalGames >= 1,
  },
  {
    id: "first-win",
    title: "On the board",
    description: "Win a round",
    icon: Trophy,
    unlocked: (stats) => stats.wins >= 1,
  },
  {
    id: "daily-set",
    title: "Three points",
    description: "Complete today’s daily set",
    icon: Sparkles,
    unlocked: (stats, today) => (stats.dailyProgress[today] || []).length === 3,
  },
  {
    id: "streak",
    title: "In rhythm",
    description: "Build a 3-day streak",
    icon: Flame,
    unlocked: (stats) => stats.bestStreak >= 3,
  },
  {
    id: "century",
    title: "Centurion",
    description: "Earn 1,000 total points",
    icon: Medal,
    unlocked: (stats) => stats.totalPoints >= 1000,
  },
  {
    id: "ten-rounds",
    title: "Regular",
    description: "Play 10 rounds",
    icon: Zap,
    unlocked: (stats) => stats.totalGames >= 10,
  },
];

export default function StatsModal({ open, onClose, stats }) {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  if (!open) return null;
  const winRate = stats.totalGames
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        className="glass-panel max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-2xl p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-lime">
              Your record
            </p>
            <h2
              id="stats-title"
              className="mt-1 font-display text-3xl font-bold uppercase"
            >
              Player stats
            </h2>
            <p className="mt-1 text-sm text-mist">
              Progress stored on this device.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-mist transition hover:text-white"
            aria-label="Close stats"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "Current streak",
              value: stats.currentStreak,
              icon: Flame,
              color: "text-orange-200",
            },
            {
              label: "Best streak",
              value: stats.bestStreak,
              icon: Trophy,
              color: "text-lime",
            },
            {
              label: "Win rate",
              value: `${winRate}%`,
              icon: Zap,
              color: "text-cyan-200",
            },
            {
              label: "Total points",
              value: stats.totalPoints.toLocaleString(),
              icon: Award,
              color: "text-yellow-100",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-lg border border-white/[.08] bg-black/15 p-3"
            >
              <Icon size={16} className={color} />
              <p className="mt-3 font-display text-2xl font-bold">{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-mist">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold uppercase">
            Achievements
          </h3>
          <span className="text-xs text-mist">
            {awards.filter((award) => award.unlocked(stats, today)).length} /{" "}
            {awards.length} unlocked
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {awards.map(({ id, title, description, icon: Icon, unlocked }) => {
            const earned = unlocked(stats, today);
            return (
              <div
                key={id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${earned ? "border-lime/20 bg-lime/[.055]" : "border-white/[.06] bg-white/[.02] opacity-55"}`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg ${earned ? "bg-lime/10 text-lime" : "bg-white/[.05] text-mist"}`}
                >
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{title}</span>
                  <span className="mt-0.5 block text-[11px] text-mist">
                    {description}
                  </span>
                </span>
                {earned && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-[.12em] text-lime">
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[10px] text-mist">
          Rounds played: {stats.totalGames}{" "}
          <span className="mx-1 text-white/20">·</span> Daily challenges
          completed:{" "}
          {
            Object.values(stats.dailyProgress).filter(
              (completed) => completed.length === 3,
            ).length
          }
        </p>
      </section>
    </div>
  );
}
