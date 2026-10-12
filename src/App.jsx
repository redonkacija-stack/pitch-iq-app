import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
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
import TicTacToeGrid from "./components/TicTacToeGrid";
import WhoAmIGame from "./components/WhoAmIGame";
import VarBlitzGame from "./components/VarBlitzGame";
import DuoLinkGame from "./components/DuoLinkGame";
import RoomInvasionGame from "./components/RoomInvasionGame";
import StatsModal from "./components/StatsModal";
import { GameProvider } from "./context/GameContext";
import { useGame } from "./context/useGame";
import { careers, matches, profiles } from "./data/gameData";
import { matchModes } from "./data/gameModes";
import { gridPlayers, leagueOptions, leagueRows, pickLeagueRows, playerMatchesGridCell } from "./data/gridData";
import { saveRoom } from "./utils/lobbySync";
import { i18n, useLanguage } from "./i18n";

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
  useLanguage();
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
            <Sparkles size={14} /> {i18n.t("heroEyebrow")}
          </div>

          <h1 className="mt-5 font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {i18n.t("heroTitle")}
            <br />
            <span className="text-lime">{i18n.t("heroSubtitle")}</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {i18n.t("heroDescription")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelect("lobby")}
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-bold text-ink shadow-lg shadow-lime/20 transition hover:bg-lime/90 active:scale-95"
            >
              <Swords size={18} /> {i18n.t("versusCta")}
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onSelect("lineup")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Shield size={16} className="text-lime" /> {i18n.t("quickXI")}
            </button>

            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3.5 py-3.5 text-xs text-slate-400">
              <Activity size={15} className="text-emerald-400" />
              {stats.totalGames} {i18n.t("roundsCompleted")}
            </span>
          </div>
        </div>
      </section>

      {/* Modes Navigation & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-lime">
              {i18n.t("modeSuite")}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {i18n.t("chooseChallenge")}
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 glass-surface p-1.5">
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
                {i18n.t(cat.toLowerCase())}
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
                className="sport-card group flex min-h-[200px] flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]"
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
                    {i18n.t(`mode_${mode.id}`)}
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
                    {i18n.t("play")} <ArrowRight size={13} />
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
            className="rounded-2xl border border-white/10 glass-surface p-5"
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

function ModeRouter({
  mode,
  room,
  challengeOffset,
  onNextChallenge,
  onBack,
  onComplete,
  onScore,
  onTurn,
  activePlayerId,
  turnDeadline,
  turnNotice,
  onProgress,
  onGridStart,
  onGridClaim,
  roomGridState,
}) {
  const matchIdx = (challengeOffset || 0) % matches.length;
  const careerIdx = (challengeOffset || 0) % careers.length;
  const profileIdx = (challengeOffset || 0) % profiles.length;

  const activeMatch = matches[matchIdx];
  const activeCareer = careers[careerIdx];
  const activeProfile = profiles[profileIdx];

  if (mode === "invasion") {
    return (
      <RoomInvasionGame room={room} onBack={onBack} onComplete={onComplete} onScore={onScore} onTurn={onTurn} activePlayerId={activePlayerId} turnDeadline={turnDeadline} turnNotice={turnNotice} />
    );
  }

  if (mode === "lineup") {
    return (
      <LineupGame
        key={`lineup-${activeMatch.id}-${challengeOffset}`}
        challenge={activeMatch}
        isDaily={false}
        onBack={onBack}
        onNext={onNextChallenge}
        onComplete={onComplete}
        onProgress={onProgress}
        room={room}
        activePlayerId={activePlayerId}
        turnDeadline={turnDeadline}
        onTurn={onTurn}
        onScore={onScore}
      />
    );
  }

  if (mode === "transfer") {
    return (
      <TransferGame
        key={`transfer-${activeCareer.id}-${challengeOffset}`}
        challenge={activeCareer}
        isDaily={false}
        onBack={onBack}
        onNext={onNextChallenge}
        onComplete={onComplete}
        room={room}
        activePlayerId={activePlayerId}
        turnDeadline={turnDeadline}
        onTurn={onTurn}
        onScore={onScore}
      />
    );
  }

  if (mode === "tactics") {
    return (
      <TacticsGame
        key={`tactics-${activeProfile.id}-${challengeOffset}`}
        challenge={activeProfile}
        isDaily={false}
        onBack={onBack}
        onNext={onNextChallenge}
        onComplete={onComplete}
        room={room}
        activePlayerId={activePlayerId}
        turnDeadline={turnDeadline}
        onTurn={onTurn}
        onScore={onScore}
      />
    );
  }

  if (mode === "market") {
    return (
      <MarketValueGame
        key={`market-${challengeOffset}`}
        onBack={onBack}
        onComplete={onComplete}
        room={room}
        activePlayerId={activePlayerId}
        turnDeadline={turnDeadline}
        onTurn={onTurn}
        onScore={onScore}
      />
    );
  }

  if (mode === "grid") {
    return (
      <TicTacToeGrid
        key={`grid-${challengeOffset}`}
        room={room}
        activePlayerId={activePlayerId}
        turnNotice={turnNotice}
        roomGridState={roomGridState || room?.gridState || null}
        onGridStart={onGridStart}
        onGridClaim={onGridClaim}
        onBack={onBack}
        onComplete={onComplete}
      />
    );
  }

  if (mode === "whoami") {
    return (
      <WhoAmIGame
        key={`whoami-${challengeOffset}`}
        initialIndex={challengeOffset}
        onBack={onBack}
        onComplete={onComplete}
        room={room}
        activePlayerId={activePlayerId}
        turnDeadline={turnDeadline}
        onTurn={onTurn}
        onScore={onScore}
      />
    );
  }

  if (mode === "var") {
    return (
      <VarBlitzGame
        key={`var-${challengeOffset}`}
        onBack={onBack}
        onComplete={onComplete}
        room={room}
        activePlayerId={activePlayerId}
        turnDeadline={turnDeadline}
        onTurn={onTurn}
        onScore={onScore}
      />
    );
  }

  return (
    <DuoLinkGame
      key={`duo-${challengeOffset}`}
      onBack={onBack}
      onComplete={onComplete}
      room={room}
      activePlayerId={activePlayerId}
      turnDeadline={turnDeadline}
      onTurn={onTurn}
      onScore={onScore}
    />
  );
}

function AppContent() {
  const language = useLanguage();
  const { stats, recordRound, setSoundEnabled } = useGame();
  useEffect(() => {
    i18n.syncDocumentLanguage();
  }, [language]);
  const [activeMode, setActiveMode] = useState(() => {
    if (typeof window === "undefined") return "home";
    return new URLSearchParams(window.location.search).has("room")
      ? "lobby"
      : "home";
  });
  const [room, setRoom] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [roomScores, setRoomScores] = useState([0, 0, 0, 0]);
  const [roomGuessed, setRoomGuessed] = useState({ A: 0, B: 0 });
  const [roomGridState, setRoomGridState] = useState(null);
  const [activePlayerId, setActivePlayerId] = useState(0);
  const [turnDeadline, setTurnDeadline] = useState(0);
  const [turnNotice, setTurnNotice] = useState("");
  const roomSyncRef = useRef(null);
  const roomGridStateRef = useRef(null);
  const activePlayerRef = useRef(0);
  const turnNoticeTimerRef = useRef(null);

  function applyTurnSwitch(nextPlayerId, type = "TURN_SWITCH", deadline = Date.now() + 15000) {
    activePlayerRef.current = nextPlayerId;
    setActivePlayerId(nextPlayerId);
    setTurnDeadline(deadline);
    setRoom((current) => current ? { ...current, activePlayerId: nextPlayerId, turnDeadline: deadline } : current);
    setTurnNotice(type === "TURN_TIMEOUT" ? "Time's Up! Turn Passed" : "");
    clearTimeout(turnNoticeTimerRef.current);
    if (type === "TURN_TIMEOUT") {
      turnNoticeTimerRef.current = setTimeout(() => setTurnNotice(""), 4000);
    }
    roomSyncRef.current?.broadcastAction({ type, activePlayerId: nextPlayerId, turnDeadline: deadline });
  }

  function handleRoomTurn(nextPlayerId, playerId = activePlayerRef.current, reason = "guess") {
    if (!room || playerId !== activePlayerRef.current) return;
    const engine = roomSyncRef.current;
    if (engine?.isHost) {
      applyTurnSwitch(nextPlayerId, reason === "timeout" ? "TURN_TIMEOUT" : "TURN_SWITCH");
    } else if (engine) {
      engine.broadcastAction({ type: "TURN_REQUEST", playerId, nextPlayerId, reason });
    } else {
      applyTurnSwitch(nextPlayerId, reason === "timeout" ? "TURN_TIMEOUT" : "TURN_SWITCH");
    }
  }

  function commitRoomGridState(nextState, targetRoom = room, engine = roomSyncRef.current) {
    roomGridStateRef.current = nextState;
    setRoomGridState(nextState);
    if (targetRoom) {
      const updatedRoom = { ...targetRoom, gridState: nextState };
      saveRoom(updatedRoom);
      setRoom((current) => current ? { ...current, gridState: nextState } : current);
    }
    engine?.broadcastAction({ type: "GRID_STATE", gridState: nextState });
  }

  function acceptRoomGridStart(leagueId, rowTeamNames, targetRoom = room, engine = roomSyncRef.current) {
    const league = leagueOptions.find((item) => item.id === leagueId);
    if (!targetRoom || !engine?.isHost || !league) return;
    const validTeamNames = Array.isArray(rowTeamNames)
      ? [...new Set(rowTeamNames)].filter((name) => league.teams.includes(name))
      : [];
    const rows = validTeamNames.length === 3
      ? leagueRows(validTeamNames)
      : pickLeagueRows(league, 0.42);
    if (rows.length !== 3) return;
    commitRoomGridState({
      leagueId,
      rows,
      cells: Array(9).fill(null),
      finished: false,
      message: "",
    }, targetRoom, engine);
  }

  function acceptRoomGridClaim(payload, senderSlot, targetRoom = room, engine = roomSyncRef.current) {
    if (!targetRoom || !engine?.isHost || senderSlot !== activePlayerRef.current) return;
    const current = roomGridStateRef.current;
    const league = leagueOptions.find((item) => item.id === payload?.leagueId);
    const index = Number(payload?.index);
    if (!current || !league || current.leagueId !== league.id || current.finished || !Number.isInteger(index) || index < 0 || index > 8 || current.cells[index]) return;
    const player = gridPlayers.find((item) => item.name === payload.playerName);
    if (!player || !playerMatchesGridCell(player, league, index) || current.cells.some((cell) => cell?.name === player.name)) return;

    const team = targetRoom.slots?.[senderSlot]?.team === "B" ? 1 : 0;
    const cells = [...current.cells];
    cells[index] = { name: player.name, clubs: player.clubs, team };
    const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const won = winningLines.some((line) => line.every((cellIndex) => cells[cellIndex]?.team === team));
    const draw = !won && cells.every(Boolean);
    const nextState = {
      ...current,
      cells,
      finished: won || draw,
      message: won ? `Team ${team + 1} wins the matrix.` : draw ? "Full time: the matrix ended in a draw." : `${player.name} claimed a tile for Team ${team + 1}.`,
    };
    commitRoomGridState(nextState, targetRoom, engine);
    setRoomScores((previous) => previous.map((score, slot) => slot === senderSlot ? score + 10 : score));
    engine.broadcastAction({ type: "ROOM_SCORE", slot: senderSlot, points: 10, completedPlayer: false });
    if (!won && !draw) applyTurnSwitch((senderSlot + 1) % (targetRoom.capacity || 2));
    else applyTurnSwitch(senderSlot, "TURN_SWITCH", 0);
  }

  function handleGridStart(leagueId, rowTeamNames) {
    if (!room) return;
    const engine = roomSyncRef.current;
    if (engine?.isHost) acceptRoomGridStart(leagueId, rowTeamNames, room, engine);
    else engine?.broadcastAction({ type: "GRID_START_REQUEST", leagueId, rowTeamNames });
  }

  function handleGridClaim(payload, botAction = false) {
    if (!room) return;
    const engine = roomSyncRef.current;
    if (botAction) {
      const hostSlot = room.slots?.find((slot) => slot.host)?.id ?? 0;
      const activeSlot = room.slots?.[activePlayerRef.current];
      if (engine?.isHost && room.localSlot === hostSlot && activeSlot?.isBot) {
        acceptRoomGridClaim(payload, activePlayerRef.current, room, engine);
      }
      return;
    }
    if (room.localSlot !== activePlayerRef.current) return;
    if (engine?.isHost) acceptRoomGridClaim(payload, room.localSlot, room, engine);
    else engine?.broadcastAction({ type: "GRID_CLAIM_REQUEST", ...payload });
  }

  useEffect(() => {
    if (!room || activeMode === "lobby" || room.localSlot !== 0 || !turnDeadline) return undefined;
    const scheduledPlayerId = activePlayerRef.current;
    const timeout = setTimeout(() => {
      if (activePlayerRef.current !== scheduledPlayerId) return;
      const nextPlayerId = (scheduledPlayerId + 1) % (room.capacity || 2);
      handleRoomTurn(nextPlayerId, scheduledPlayerId, "timeout");
    }, Math.max(0, turnDeadline - Date.now()));
    return () => clearTimeout(timeout);
  }, [room?.code, room?.localSlot, room?.capacity, activeMode, activePlayerId, turnDeadline]);

  useEffect(() => () => clearTimeout(turnNoticeTimerRef.current), []);

  // Challenge rotation tracker: ensures every visit and replay produces a brand new challenge
  const [challengeOffsets, setChallengeOffsets] = useState(() => ({
    lineup: Math.floor(Math.random() * matches.length),
    transfer: Math.floor(Math.random() * careers.length),
    tactics: Math.floor(Math.random() * profiles.length),
    grid: Math.floor(Math.random() * 5),
    whoami: Math.floor(Math.random() * 12),
    market: Math.floor(Math.random() * 10),
    var: Math.floor(Math.random() * 10),
    duo: Math.floor(Math.random() * 10),
  }));

  function advanceChallenge(modeName) {
    setChallengeOffsets((prev) => {
      const getPoolSize = (m) => {
        if (m === "lineup") return matches.length;
        if (m === "transfer") return careers.length;
        if (m === "tactics") return profiles.length;
        if (m === "grid") return 5;
        if (m === "whoami") return 12;
        return 20;
      };
      const size = getPoolSize(modeName);
      const current = prev[modeName] ?? 0;
      // Step to next challenge + random skip so it is guaranteed different
      const step = 1 + Math.floor(Math.random() * Math.max(1, size - 1));
      const nextVal = (current + step) % size;
      return {
        ...prev,
        [modeName]: nextVal,
      };
    });
  }

  function enterMode(mode) {
    if (mode === "stats") {
      setShowStats(true);
      return;
    }
    if (mode === "lobby") {
      setActiveMode("lobby");
      return;
    }
    // Advance challenge offset so selecting a game always brings up a fresh challenge!
    advanceChallenge(mode);
    setRoom(null);
    setActiveMode(mode);
  }

  function handleBackToHub() {
    // When exiting a challenge back to the hub, advance again so returning generates new players/clubs!
    if (activeMode && activeMode !== "home" && activeMode !== "lobby") {
      advanceChallenge(activeMode);
    }
    setActiveMode(room ? "lobby" : "home");
  }

  function handleNextChallenge() {
    advanceChallenge(activeMode);
  }

  function handleStartRoom(launchedRoom, syncEngine) {
    roomSyncRef.current = syncEngine || null;
    if (syncEngine) {
      syncEngine.onGameAction = (action) => {
        if (action?.type === "ROOM_SCORE") {
          setRoomScores((previous) => previous.map((value, index) => index === action.slot ? value + action.points : value));
          if (action.completedPlayer) {
            const team = launchedRoom.slots?.[action.slot]?.team || (action.slot % 2 === 0 ? "A" : "B");
            setRoomGuessed((previous) => ({ ...previous, [team]: (previous[team] || 0) + 1 }));
          }
        } else if (action?.type === "ROOM_SCORE_REQUEST" && syncEngine.isHost && action.senderSlot === action.slot && action.slot === activePlayerRef.current) {
          const team = launchedRoom.slots?.[action.slot]?.team || (action.slot % 2 === 0 ? "A" : "B");
          setRoomScores((previous) => previous.map((value, index) => index === action.slot ? value + action.points : value));
          if (action.completedPlayer) {
            setRoomGuessed((previous) => ({ ...previous, [team]: (previous[team] || 0) + 1 }));
          }
          syncEngine.broadcastAction({ type: "ROOM_SCORE", slot: action.slot, points: action.points, completedPlayer: action.completedPlayer });
        } else if (action?.type === "GRID_START_REQUEST" && syncEngine.isHost) {
          const hostSlot = launchedRoom.slots?.find((slot) => slot.host)?.id ?? 0;
          if (action.senderSlot === hostSlot) acceptRoomGridStart(action.leagueId, action.rowTeamNames, launchedRoom, syncEngine);
        } else if (action?.type === "GRID_CLAIM_REQUEST" && syncEngine.isHost) {
          acceptRoomGridClaim(action, action.senderSlot, launchedRoom, syncEngine);
        } else if (action?.type === "GRID_STATE" && !syncEngine.isHost) {
          roomGridStateRef.current = action.gridState;
          setRoomGridState(action.gridState);
          setRoom((current) => current ? { ...current, gridState: action.gridState } : current);
        } else if (action?.type === "TURN_REQUEST" && syncEngine.isHost) {
          const currentPlayerId = activePlayerRef.current;
          const expectedNext = (currentPlayerId + 1) % (launchedRoom.capacity || 2);
          if (action.senderSlot === currentPlayerId && action.playerId === currentPlayerId && action.nextPlayerId === expectedNext && action.reason !== "timeout") {
            applyTurnSwitch(expectedNext);
          }
        } else if ((action?.type === "TURN_SWITCH" || action?.type === "TURN_TIMEOUT") && !syncEngine.isHost) {
          activePlayerRef.current = action.activePlayerId;
          setActivePlayerId(action.activePlayerId);
          const deadline = action.turnDeadline ?? Date.now() + 15000;
          setTurnDeadline(deadline);
          setRoom((current) => current ? { ...current, activePlayerId: action.activePlayerId, turnDeadline: deadline } : current);
          setTurnNotice(action.type === "TURN_TIMEOUT" ? "Time's Up! Turn Passed" : "");
          clearTimeout(turnNoticeTimerRef.current);
          if (action.type === "TURN_TIMEOUT") {
            turnNoticeTimerRef.current = setTimeout(() => setTurnNotice(""), 4000);
          }
        }
      };
    }
    const hostPlayerId = launchedRoom.slots?.find((slot) => slot.host)?.id ?? 0;
    const firstPlayerId = launchedRoom.activePlayerId ?? hostPlayerId;
    const firstDeadline = launchedRoom.turnDeadline || Date.now() + 15000;
    activePlayerRef.current = firstPlayerId;
    setActivePlayerId(firstPlayerId);
    setTurnDeadline(firstDeadline);
    setTurnNotice("");
    setRoom(launchedRoom);
    roomGridStateRef.current = launchedRoom.gridState || null;
    setRoomGridState(launchedRoom.gridState || null);
    setRoomScores(Array(launchedRoom.capacity).fill(0));
    setRoomGuessed({ A: 0, B: 0 });
    setActiveMode(launchedRoom.mode);
  }

  function handleProgressUpdate(_count) {
    if (room) {
      const activeSlot = activePlayerId;
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

  }

  function handlePassTurn() {
    if (!room || room.localSlot !== activePlayerId) return;
    handleRoomTurn((activePlayerId + 1) % room.capacity, activePlayerId, "pass");
  }

  function handleRoomScore(slot, points, completedPlayer) {
    const team = room?.slots?.[slot]?.team || (slot % 2 === 0 ? "A" : "B");
    const engine = roomSyncRef.current;
    if (engine && !engine.isHost) {
      engine.broadcastAction({ type: "ROOM_SCORE_REQUEST", slot, points, completedPlayer });
      return;
    }
    setRoomScores((previous) => previous.map((value, index) => index === slot ? value + points : value));
    if (completedPlayer) setRoomGuessed((previous) => ({ ...previous, [team]: (previous[team] || 0) + 1 }));
    engine?.broadcastAction({ type: "ROOM_SCORE", slot, points, completedPlayer });
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-emerald-400 selection:text-slate-950">
      {/* Primary Global Navigation */}
      <GameNavbar
        activeMode={activeMode}
        onHome={handleBackToHub}
        onLobby={() => enterMode("lobby")}
        onStats={() => setShowStats(true)}
        soundEnabled={stats.soundEnabled}
        onSoundChange={setSoundEnabled}
      />

      {/* Persistent Quick Exit Banner: if player opens wrong challenge, one-click back */}
      {activeMode !== "home" && activeMode !== "lobby" && !room && (
        <div className="border-b border-white/10 bg-slate-950/85 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button
              onClick={handleBackToHub}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime/40 hover:bg-lime/10 hover:text-lime active:scale-95"
            >
              <ArrowLeft size={14} /> Back to Hub & Pick Another Mode
            </button>
            <span className="text-[11px] font-medium text-slate-400">
              New challenges re-generated automatically on return
            </span>
          </div>
        </div>
      )}

      {/* Top Split Scoreboard Header (when in a multiplayer room) */}
      {room && activeMode !== "lobby" && (
        <LiveScoreHeader
          room={room}
          scores={roomScores}
          guessedCounts={roomGuessed}
          activeTurn={activePlayerId}
          onPassTurn={room.localSlot === activePlayerId ? handlePassTurn : undefined}
          onExitRoom={() => {
            roomSyncRef.current?.destroy();
            roomSyncRef.current = null;
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
            syncEngine={roomSyncRef.current}
            onBack={() => {
              setRoom(null);
              setActiveMode("home");
            }}
            onStart={handleStartRoom}
          />
        ) : (
          <ModeRouter
            key={`${activeMode}-${challengeOffsets[activeMode] || 0}-${room?.code || "solo"}`}
            mode={activeMode}
            room={room}
            challengeOffset={challengeOffsets[activeMode] || 0}
            onNextChallenge={handleNextChallenge}
            onBack={handleBackToHub}
            onComplete={handleCompleteRound}
            onScore={handleRoomScore}
            onTurn={handleRoomTurn}
            activePlayerId={activePlayerId}
            turnDeadline={turnDeadline}
            turnNotice={turnNotice}
            onProgress={handleProgressUpdate}
            onGridStart={handleGridStart}
            onGridClaim={handleGridClaim}
            roomGridState={roomGridState}
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
