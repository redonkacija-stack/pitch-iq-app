import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CircleHelp,
  Crosshair,
  Filter,
  Grid3X3,
  Link2,
  Search,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import GameNavbar from "./components/GameNavbar";
import LiveScoreHeader from "./components/LiveScoreHeader";
import MatchLobby from "./components/MatchLobby";
import LineupGame from "./components/LineupGame";
import TransferGame from "./components/TransferGame";
import TacticsGame from "./components/TacticsGame";
import MarketValueGame from "./components/MarketValueGame";
import FootballGridGame from "./components/FootballGridGame";
import WhoAmIGame from "./components/WhoAmIGame";
import VarBlitzGame from "./components/VarBlitzGame";
import DuoLinkGame from "./components/DuoLinkGame";
import RoomInvasionGame from "./components/RoomInvasionGame";
import StatsModal from "./components/StatsModal";
import { GameProvider } from "./context/GameContext";
import { useGame } from "./context/useGame";
import { careers, matches, profiles } from "./data/gameData";
import { matchModes } from "./data/gameModes";
import { saveRoom } from "./utils/lobbySync";

const modeIcons = {
  lineup: Shield,
  transfer: Link2,
  tactics: Crosshair,
  market: TrendingUp,
  grid: Grid3X3,
  whoami: Search,
  var: Zap,
  duo: Users,
  invasion: Swords,
};

function Hub({ onSelect, stats }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Tactical",
    "Trivia",
    "Speed",
    "Strategy",
    "Multiplayer",
  ];

  const filteredModes = matchModes.filter((m) => {
    if (activeCategory === "All") return true;
    return m.category === activeCategory;
  });

  return (
    <main className="mx-auto max-w-[1360px] space-y-8 px-4 py-7 sm:px-7 lg:px-9">
      {/* Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-lime/20 bg-gradient-to-br from-[#141f34] via-[#10192b] to-[#0a1120] p-6 shadow-2xl sm:p-10">
        <div className="absolute -right-16 -top-28 h-96 w-96 rounded-full border border-lime/[.08] pointer-events-none" />
        <div className="absolute right-14 top-[-60px] h-72 w-72 rounded-full border border-sky-400/[.07] pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-lime">
            <Sparkles size={14} /> The Ultimate Football IQ Arcade
          </div>

          <h1 className="mt-5 font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Every Era. Every Angle.
            <br />
            <span className="text-lime">One More Game.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Test your football tactical intuition, trace world-class career
            paths, decode managerial philosophies, and battle friends in 1v1
            and 2v2 multiplayer lobby rooms.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelect("lobby")}
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-bold text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90 active:scale-95"
            >
              <Swords size={18} /> Versus Lobby (1v1 & 2v2)
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onSelect("lineup")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Shield size={16} className="text-lime" /> Quick Starting XI
            </button>

            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3.5 py-3.5 text-xs text-slate-400">
              <Activity size={15} className="text-emerald-400" />
              {stats.totalGames} Rounds Completed
            </span>
          </div>
        </div>
      </section>

      {/* Modes Navigation & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-lime">
              Game Mode Suite
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Choose Your Challenge
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#121c2e] p-1.5">
            <Filter size={14} className="ml-2 mr-1 text-slate-500" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeCategory === cat
                    ? "bg-lime text-ink font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Game Mode Cards Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredModes.map((mode) => {
            const ModeIcon = modeIcons[mode.id] || CircleHelp;
            return (
              <button
                key={mode.id}
                onClick={() => onSelect(mode.id)}
                className="group flex min-h-[200px] flex-col justify-between rounded-2xl border border-white/10 bg-[#141f34] p-5 text-left transition hover:-translate-y-1 hover:border-lime/40 hover:bg-[#1a2740] hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/25 text-lime transition group-hover:scale-105 group-hover:border-lime/30">
                      <ModeIcon size={19} />
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      {mode.category || "Mode"}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold text-white transition group-hover:text-lime">
                    {mode.label}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {mode.detail || mode.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] text-slate-500">
                    {mode.players || "1–4 Players"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-lime transition group-hover:translate-x-0.5">
                    Launch <ArrowRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </section>
      </div>

      {/* Feature Highlights Banner */}
      <section className="grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
        {[
          {
            title: "Tactical Pitch Visualization",
            copy: "Analyze iconic starting formations, positional play systems, and tactical triggers on responsive pitch boards.",
          },
          {
            title: "Career & Connection Chains",
            copy: "Chronological club paths and teammate connections linking stars across decades and leagues.",
          },
          {
            title: "1v1 & 2v2 Lobby Sync",
            copy: "Generate 6-character room codes for synchronized multi-device competition with split scoreboards.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-[#121c2e]/60 p-5"
          >
            <h3 className="font-display text-sm font-bold text-white">
              {item.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              {item.copy}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}

function ModeRouter({ mode, room, onBack, onComplete, onProgress }) {
  // Challenge rotation index for modes with datasets
  const [matchIdx, setMatchIdx] = useState(0);
  const [careerIdx, setCareerIdx] = useState(0);
  const [profileIdx, setProfileIdx] = useState(0);

  const activeMatch = matches[matchIdx % matches.length];
  const activeCareer = careers[careerIdx % careers.length];
  const activeProfile = profiles[profileIdx % profiles.length];

  if (mode === "invasion") {
    return (
      <RoomInvasionGame room={room} onBack={onBack} onComplete={onComplete} />
    );
  }

  if (mode === "lineup") {
    return (
      <LineupGame
        key={`lineup-${activeMatch.id}`}
        challenge={activeMatch}
        isDaily={false}
        onBack={onBack}
        onNext={() => setMatchIdx((prev) => prev + 1)}
        onComplete={onComplete}
        onProgress={onProgress}
      />
    );
  }

  if (mode === "transfer") {
    return (
      <TransferGame
        key={`transfer-${activeCareer.id}`}
        challenge={activeCareer}
        isDaily={false}
        onBack={onBack}
        onNext={() => setCareerIdx((prev) => prev + 1)}
        onComplete={onComplete}
      />
    );
  }

  if (mode === "tactics") {
    return (
      <TacticsGame
        key={`tactics-${activeProfile.id}`}
        challenge={activeProfile}
        isDaily={false}
        onBack={onBack}
        onNext={() => setProfileIdx((prev) => prev + 1)}
        onComplete={onComplete}
      />
    );
  }

  if (mode === "market") {
    return <MarketValueGame onBack={onBack} onComplete={onComplete} />;
  }

  if (mode === "grid") {
    return <FootballGridGame onBack={onBack} onComplete={onComplete} />;
  }

  if (mode === "whoami") {
    return <WhoAmIGame onBack={onBack} onComplete={onComplete} />;
  }

  if (mode === "var") {
    return <VarBlitzGame onBack={onBack} onComplete={onComplete} />;
  }

  return <DuoLinkGame onBack={onBack} onComplete={onComplete} />;
}

function AppContent() {
  const { stats, recordRound, setSoundEnabled } = useGame();
  const [activeMode, setActiveMode] = useState("home");
  const [room, setRoom] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [roomScores, setRoomScores] = useState([0, 0, 0, 0]);
  const [roomGuessed, setRoomGuessed] = useState({ A: 0, B: 0 });
  const [roomTurn, setRoomTurn] = useState(0);

  function enterMode(mode) {
    if (mode === "stats") {
      setShowStats(true);
      return;
    }
    if (mode === "lobby") {
      setActiveMode("lobby");
      return;
    }
    setRoom(null);
    setActiveMode(mode);
  }

  function handleStartRoom(launchedRoom) {
    setRoom(launchedRoom);
    setRoomScores(Array(launchedRoom.capacity).fill(0));
    setRoomGuessed({ A: 0, B: 0 });
    setRoomTurn(launchedRoom.localSlot || 0);
    setActiveMode(launchedRoom.mode);
  }

  function handleProgressUpdate(_count) {
    if (room) {
      const activeSlot = roomTurn;
      const team = room.slots?.[activeSlot]?.team || "A";
      setRoomGuessed((prev) => {
        const next = { ...prev, [team]: (prev[team] || 0) + 1 };
        saveRoom({ ...room, teamGuessed: next });
        return next;
      });
    }
  }

  function handleCompleteRound(points, won) {
    recordRound(
      activeMode,
      points,
      won,
      false,
      new Date().toISOString().slice(0, 10),
    );

    if (room) {
      const slot = roomTurn;
      const team = room.slots?.[slot]?.team || "A";

      setRoomScores((old) => {
        const next = old.map((v, i) => (i === slot ? v + points : v));
        return next;
      });

      if (won) {
        setRoomGuessed((prev) => ({
          ...prev,
          [team]: (prev[team] || 0) + 1,
        }));
      }

      // Rotate turn to next slot
      const nextTurn = (roomTurn + 1) % room.capacity;
      setRoomTurn(nextTurn);
    }
  }

  function handlePassTurn() {
    if (!room) return;
    setRoomTurn((prev) => (prev + 1) % room.capacity);
  }

  return (
    <div className="min-h-screen bg-ink text-white font-sans selection:bg-lime selection:text-ink">
      {/* Primary Global Navigation */}
      <GameNavbar
        activeMode={activeMode}
        onHome={() => enterMode("home")}
        onLobby={() => enterMode("lobby")}
        onStats={() => setShowStats(true)}
        soundEnabled={stats.soundEnabled}
        onSoundChange={setSoundEnabled}
      />

      {/* Top Split Scoreboard Header (when in a multiplayer room) */}
      {room && activeMode !== "lobby" && (
        <LiveScoreHeader
          room={room}
          scores={roomScores}
          guessedCounts={roomGuessed}
          activeTurn={roomTurn}
          onPassTurn={handlePassTurn}
          onExitRoom={() => {
            setRoom(null);
            setActiveMode("lobby");
          }}
        />
      )}

      {/* Main Content Router */}
      <main>
        {activeMode === "home" ? (
          <Hub onSelect={enterMode} stats={stats} />
        ) : activeMode === "lobby" ? (
          <MatchLobby
            initialRoom={room}
            onBack={() => {
              setRoom(null);
              setActiveMode("home");
            }}
            onStart={handleStartRoom}
          />
        ) : (
          <ModeRouter
            key={`${activeMode}-${room?.code || "solo"}`}
            mode={activeMode}
            room={room}
            onBack={() => {
              setActiveMode(room ? "lobby" : "home");
            }}
            onComplete={handleCompleteRound}
            onProgress={handleProgressUpdate}
          />
        )}
      </main>

      {/* Career & Play Stats Modal */}
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />

      {/* Clean Global Footer */}
      <footer className="mt-16 border-t border-white/10 px-4 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <span>PitchIQ • Football Knowledge in Play</span>
          <span>1v1 & 2v2 Versus Room Code Engine</span>
          <span>© 2026 PitchIQ</span>
        </div>
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
