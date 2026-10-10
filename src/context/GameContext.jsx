import { GameContext } from "./contextValue";
import { useEffect, useState } from "react";

const STORAGE_KEY = "pitchiq:stats:v1";
const defaultStats = {
  totalPoints: 0,
  totalGames: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastDailyDate: null,
  dailyProgress: {},
  soundEnabled: true,
};

function loadStats() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return stored ? { ...defaultStats, ...stored } : defaultStats;
  } catch {
    return defaultStats;
  }
}

function yesterday(date) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

export function GameProvider({ children }) {
  const [stats, setStats] = useState(loadStats);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      /* Stats remain available for this session. */
    }
  }, [stats]);

  function setSoundEnabled(enabled) {
    setStats((current) => ({ ...current, soundEnabled: enabled }));
  }

  function recordRound(mode, points, won, isDaily, date) {
    setStats((current) => {
      const next = {
        ...current,
        totalPoints: current.totalPoints + points,
        totalGames: current.totalGames + 1,
        wins: current.wins + (won ? 1 : 0),
      };
      if (isDaily) {
        const completed = [
          ...new Set([...(current.dailyProgress[date] || []), mode]),
        ];
        next.dailyProgress = { ...current.dailyProgress, [date]: completed };
        if (completed.length === 3 && current.lastDailyDate !== date) {
          const streak =
            current.lastDailyDate === yesterday(date)
              ? current.currentStreak + 1
              : 1;
          next.currentStreak = streak;
          next.bestStreak = Math.max(current.bestStreak, streak);
          next.lastDailyDate = date;
        }
      }
      return next;
    });
  }

  return (
    <GameContext.Provider value={{ stats, recordRound, setSoundEnabled }}>
      {children}
    </GameContext.Provider>
  );
}
