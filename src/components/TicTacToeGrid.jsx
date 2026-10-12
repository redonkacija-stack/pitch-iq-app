import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Globe2,
  Grid3X3,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import ClubCrest from "./ClubCrest";
import FlagIcon from "./FlagIcon";
import { DATA_AS_OF, DATA_SEASON } from "../data/seasonConfig";
import {
  gridCriteriaForCell,
  gridPlayers,
  leagueOptions,
  pickLeagueRows,
  playerMatchesGridCriterion,
} from "../data/gridData";

const clubCrests = {
  "real madrid": "https://commons.wikimedia.org/wiki/Special:FilePath/Real_Madrid_CF.svg?width=128",
  barcelona: "https://commons.wikimedia.org/wiki/Special:FilePath/FC_Barcelona_%28crest%29.svg?width=128",
  arsenal: "https://commons.wikimedia.org/wiki/Special:FilePath/Arsenal_FC.svg?width=128",
  "manchester city": "https://commons.wikimedia.org/wiki/Special:FilePath/Manchester_City_FC_badge.svg?width=128",
  "bayern munich": "https://commons.wikimedia.org/wiki/Special:FilePath/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg?width=128",
  liverpool: "https://commons.wikimedia.org/wiki/Special:FilePath/Liverpool_FC.svg?width=128",
  chelsea: "https://commons.wikimedia.org/wiki/Special:FilePath/Chelsea_FC.svg?width=128",
  "borussia dortmund": "https://commons.wikimedia.org/wiki/Special:FilePath/Borussia_Dortmund_logo.svg?width=128",
  "paris saint-germain": "https://commons.wikimedia.org/wiki/Special:FilePath/Paris_Saint-Germain_F.C..svg?width=128",
  "ac milan": "https://commons.wikimedia.org/wiki/Special:FilePath/AC_Milan.svg?width=128",
};

const leagueStyle = {
  PL: "border-violet-300/25 bg-violet-400/10 text-violet-100",
  LL: "border-orange-300/25 bg-orange-400/10 text-orange-100",
  SA: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  L1: "border-blue-300/25 bg-blue-400/10 text-blue-100",
  ERE: "border-orange-300/25 bg-orange-400/10 text-orange-100",
  LPF: "border-sky-300/25 bg-sky-400/10 text-sky-100",
  "BR A": "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
};

function normalize(value = "") {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function initials(name = "") {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function CriterionIcon({ criterion, league }) {
  if (criterion.type === "club") {
    const logoName = Object.keys(clubCrests).find((name) => normalize(criterion.value).includes(name));
    return logoName ? <ClubCrest src={clubCrests[logoName]} alt={`${criterion.value} crest`} className="h-9 w-9" /> : <ClubCrest alt={`${criterion.value} crest`} className="h-9 w-9" />;
  }
  if (criterion.type === "country") {
    const flags = { Argentina: "ar", Brazil: "br", England: "gb-eng", France: "fr", Germany: "de", Netherlands: "nl", Norway: "no", Portugal: "pt", Spain: "es", Sweden: "se" };
    return <FlagIcon code={flags[criterion.value]} label={`${criterion.value} flag`} className="h-6 w-9 rounded border border-white/15 shadow-lg" />;
  }
  if (criterion.type === "league") {
    return <span className={`grid h-9 w-9 place-items-center rounded-xl border text-[9px] font-black ${leagueStyle[league?.emblem] || "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"}`}>{league?.emblem || "LGE"}</span>;
  }
  if (criterion.type === "trophy") return <span className="grid h-9 w-9 place-items-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-amber-200"><Trophy size={17} /></span>;
  if (criterion.type === "manager") return <span className="grid h-9 w-9 place-items-center rounded-xl border border-sky-300/20 bg-sky-300/10 text-sky-200"><Shield size={17} /></span>;
  return <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300"><CircleHelp size={17} /></span>;
}

function LeagueSelection({ onSelect, onBack, waitingForHost = false }) {
  return (
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-7 sm:px-7">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 active:scale-95">
        <ArrowLeft size={14} /> Back
      </button>
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-200"><Grid3X3 size={13} /> Football Matrix</span>
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-wide text-white sm:text-5xl">Choose a League</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">Pick a football universe. Each matrix is built from teams, honors and nationalities tied to that competition.</p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-600">Season snapshot · {DATA_SEASON} · {DATA_AS_OF}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Choose a league">
        {leagueOptions.map((league) => (
          <button key={league.id} type="button" disabled={waitingForHost} onClick={() => onSelect(league)} className="group flex min-h-[230px] flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-center shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 shadow-inner transition group-hover:border-emerald-400/30 group-hover:bg-emerald-400/[.08]">
              {league.flag ? <FlagIcon code={league.flag} label={`${league.name} flag`} className="h-8 w-12 rounded border border-white/10" /> : <Globe2 className="text-emerald-300" size={32} />}
            </span>
            <span className="text-lg font-black uppercase tracking-[.12em] text-amber-200 group-hover:text-emerald-200">{league.name}</span>
            <span className="mt-1 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-300" style={{ borderColor: "rgba(148,163,184,.2)" }}>{league.emblem} · {league.season}</span>
            <span className="mt-3 flex-1 text-xs leading-relaxed text-slate-400">{league.description}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">Enter matrix <ChevronRight size={13} /></span>
          </button>
        ))}
      </section>
      {waitingForHost && <p role="status" className="text-center text-xs font-bold uppercase tracking-wider text-sky-200">Waiting for the host to choose a league…</p>}
      <p className="text-center text-[10px] text-slate-600">League membership and squad references are frozen to the labeled snapshot. Historical honours remain tied to the season in which they were earned.</p>
    </div>
  );
}

export default function TicTacToeGrid({ onBack, onComplete, room = null, activePlayerId = 0, turnNotice = "", roomGridState = null, onGridStart, onGridClaim }) {
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [localCells, setLocalCells] = useState(Array(9).fill(null));
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [localTurn, setLocalTurn] = useState(0);
  const [finished, setFinished] = useState(false);
  const botActionRef = useRef("");
  const isRoomMatch = Boolean(room);
  const roomHostId = room?.slots?.find((slot) => slot.host)?.id ?? 0;
  const isRoomHost = isRoomMatch && room.localSlot === roomHostId;
  const isMyTurn = !isRoomMatch || room.localSlot === activePlayerId;
  const cells = isRoomMatch ? roomGridState?.cells || Array(9).fill(null) : localCells;
  const turn = isRoomMatch ? (room.slots?.[activePlayerId]?.team === "B" ? 1 : 0) : localTurn;
  const currentLeague = useMemo(() => {
    if (!isRoomMatch) return selectedLeague;
    const league = leagueOptions.find((item) => item.id === roomGridState?.leagueId);
    return league ? { ...league, rows: roomGridState?.rows?.length === 3 ? roomGridState.rows : league.rows.slice(0, 3) } : null;
  }, [isRoomMatch, roomGridState?.leagueId, roomGridState?.rows, selectedLeague]);
  const matchFinished = isRoomMatch ? Boolean(roomGridState?.finished) : finished;
  const matchMessage = isRoomMatch ? roomGridState?.message || "" : message;

  useEffect(() => {
    if (isRoomMatch && !isMyTurn) setSelected(null);
  }, [isRoomMatch, isMyTurn]);

  const activeCriteria = useMemo(() => {
    if (!currentLeague) return [];
    return Array.from({ length: 9 }, (_, index) => gridCriteriaForCell(currentLeague, index));
  }, [currentLeague]);

  const eligiblePlayers = useMemo(() => {
    if (selected === null) return [];
    const { row, column } = activeCriteria[selected];
    const search = normalize(query);
    return gridPlayers.filter((player) =>
      playerMatchesGridCriterion(player, row) && playerMatchesGridCriterion(player, column) &&
      !cells.some((cell) => cell?.name === player.name) &&
      (!search || normalize(player.name).includes(search))
    ).slice(0, 7);
  }, [activeCriteria, cells, query, selected]);

  // Bot turns are executed by the host so every connected client receives the
  // same validated tile claim and scoreboard update.
  useEffect(() => {
    const botSlot = room ? activePlayerId : -1;
    const bot = room?.slots?.[botSlot];
    if (!isRoomMatch || !isRoomHost || !bot?.isBot || !currentLeague || matchFinished || !roomGridState) return undefined;

    const actionKey = `${room.code}:${room.turnDeadline || "turn"}:${roomGridState.leagueId}:${cells.filter(Boolean).length}:${botSlot}`;
    if (botActionRef.current === actionKey) return undefined;
    const delayProfiles = { Easy: [6500, 8500], Medium: [4500, 7000], Hard: [2500, 5000] };
    const [minDelay, maxDelay] = delayProfiles[bot.botDifficulty] || delayProfiles.Medium;
    const timer = setTimeout(() => {
      const options = [];
      for (let index = 0; index < 9; index += 1) {
        if (cells[index]) continue;
        const { row, column } = gridCriteriaForCell(currentLeague, index);
        const candidates = gridPlayers.filter((player) =>
          playerMatchesGridCriterion(player, row) &&
          playerMatchesGridCriterion(player, column) &&
          !cells.some((cell) => cell?.name === player.name)
        );
        if (candidates.length) options.push({ index, player: candidates[Math.floor(Math.random() * candidates.length)] });
      }
      if (!options.length) return;
      botActionRef.current = actionKey;
      const choice = options[Math.floor(Math.random() * options.length)];
      onGridClaim?.({ index: choice.index, playerName: choice.player.name, leagueId: currentLeague.id }, true);
    }, minDelay + Math.random() * (maxDelay - minDelay));
    return () => clearTimeout(timer);
  }, [activePlayerId, cells, currentLeague, isRoomHost, isRoomMatch, matchFinished, onGridClaim, room, roomGridState]);

  function chooseLeague(league) {
    const rows = pickLeagueRows(league);
    if (isRoomMatch) {
      if (isRoomHost) onGridStart?.(league.id, rows.map((row) => row.value));
      return;
    }
    setSelectedLeague({ ...league, rows });
    setLocalCells(Array(9).fill(null));
    setSelected(null);
    setQuery("");
    setMessage("");
    setLocalTurn(0);
    setFinished(false);
  }

  function claimTile(player) {
    if (selected === null || matchFinished || !isMyTurn) return;
    if (isRoomMatch) {
      onGridClaim?.({ index: selected, playerName: player.name, leagueId: currentLeague.id });
      setSelected(null);
      setQuery("");
      return;
    }
    const next = [...cells];
    next[selected] = { ...player, team: turn };
    setLocalCells(next);
    setSelected(null);
    setQuery("");

    const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const winner = winningLines.some((line) => line.every((index) => next[index]?.team === turn));
    if (winner) {
      setFinished(true);
      setMessage(`Team ${turn + 1} wins the ${currentLeague.name} matrix.`);
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, colors: ["#10b981", "#38bdf8", "#fbbf24"] });
      onComplete?.(150, true);
    } else if (next.every(Boolean)) {
      setFinished(true);
      setMessage("Full time: the matrix ended in a draw.");
      onComplete?.(75, false);
    } else {
      setLocalTurn((previous) => previous === 0 ? 1 : 0);
      setMessage(`${player.name} claimed the tile for Team ${turn + 1}.`);
    }
  }

  function resetMatch() {
    setLocalCells(Array(9).fill(null));
    setSelected(null);
    setQuery("");
    setMessage("");
    setLocalTurn(0);
    setFinished(false);
  }

  if (!currentLeague) return <LeagueSelection onSelect={chooseLeague} onBack={onBack} waitingForHost={isRoomMatch && !isRoomHost} />;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        {!isRoomMatch && <button onClick={() => { setSelectedLeague(null); resetMatch(); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 active:scale-95"><ArrowLeft size={14} /> Change league</button>}
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300"><span className="text-emerald-200">{currentLeague.emblem}</span>{currentLeague.name} · {currentLeague.season}</span>
      </header>

      {matchFinished ? (
        <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-7 text-center shadow-2xl sm:p-10" role="status">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200"><Trophy size={30} /></span>
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-300">Full Time</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white">{matchMessage.includes("draw") ? "A hard-fought draw" : matchMessage || `Team ${turn + 1} takes the matrix`}</h1>
          <p className="mt-3 text-sm text-slate-300">{cells.filter(Boolean).length} of 9 tiles claimed in {currentLeague.name}.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {!isRoomMatch && <button onClick={resetMatch} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300 active:scale-95"><RotateCcw size={14} /> Play again</button>}
            {!isRoomMatch && <button onClick={() => { setSelectedLeague(null); resetMatch(); }} className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10">Choose another league</button>}
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-emerald-400/15 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-emerald-950/25 p-5 shadow-xl sm:flex sm:items-end sm:justify-between sm:p-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.17em] text-emerald-200"><Grid3X3 size={13} /> Football Matrix</span>
              <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">{currentLeague.competition} Challenge</h1>
              <p className="mt-1 text-xs text-slate-400">Claim a square by naming a player who matches both criteria.</p>
            </div>
            <div className={`mt-4 rounded-xl border px-4 py-2.5 sm:mt-0 ${turn === 0 ? "border-emerald-400/30 bg-emerald-400/10" : "border-sky-400/30 bg-sky-400/10"}`}>
              <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">On the clock</span>
              <span className={`text-xs font-extrabold uppercase tracking-wider ${turn === 0 ? "text-emerald-200" : "text-sky-200"}`}>{isRoomMatch ? isMyTurn ? "Your turn" : `Waiting for ${room.slots?.[activePlayerId]?.name || "opponent"}` : `Team ${turn + 1}`}</span>
            </div>
          </section>

          {turnNotice && <p role="status" className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-amber-100">{turnNotice}</p>}
          {isRoomMatch && <p role="status" className={`rounded-xl border px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wider ${isMyTurn ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-sky-300/25 bg-sky-300/10 text-sky-100"}`}>{isMyTurn ? "Your turn — make a claim" : `Opponent's turn — waiting for ${room.slots?.[activePlayerId]?.name || "player"}`}</p>}

          <section className="mx-auto max-w-3xl rounded-3xl border border-slate-700/70 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,.10),transparent_55%),linear-gradient(145deg,rgba(15,23,42,.98),rgba(2,6,23,.98))] p-3 shadow-[0_20px_70px_rgba(0,0,0,.45)] sm:p-5" aria-label={`${currentLeague.name} 3 by 3 football matrix`}>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {currentLeague.columns.map((criterion, index) => (
                <div key={`${criterion.type}-${criterion.value}`} className="flex min-h-[78px] items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-2.5 shadow-lg backdrop-blur-xl sm:min-h-[90px] sm:gap-3 sm:p-3.5">
                  <CriterionIcon criterion={criterion} league={currentLeague} />
                  <span className="text-[9px] font-extrabold uppercase leading-tight tracking-wide text-slate-100 sm:text-xs">{criterion.label}</span>
                  <span className="sr-only">Column {index + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-4 md:mt-4 md:space-y-5">
              {currentLeague.rows.map((row, rowIndex) => (
                <div key={`${row.type}-${row.value}`}>
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-950/75 px-3 py-2 sm:mb-3 sm:px-4">
                    <CriterionIcon criterion={row} league={currentLeague} />
                    <span className="text-[9px] font-extrabold uppercase tracking-[.13em] text-amber-100 sm:text-xs">{row.label}</span>
                    <span className="ml-auto text-[8px] font-bold uppercase tracking-wider text-slate-500">Row {rowIndex + 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {[0,1,2].map((columnIndex) => {
                      const index = rowIndex * 3 + columnIndex;
                      const cell = cells[index];
                      const active = selected === index;
                      const clubName = cell?.clubs?.find((name) => clubCrests[normalize(name)]) || cell?.clubs?.[0];
                      return (
                        <button key={index} type="button" onClick={() => { if (!cell && isMyTurn && !matchFinished) { setSelected(index); setQuery(""); setMessage(""); } }} disabled={Boolean(cell) || !isMyTurn || matchFinished} aria-label={cell ? `Claimed by ${cell.name}, Team ${cell.team + 1}` : `Open tile: ${row.label} and ${currentLeague.columns[columnIndex].label}`} className={`group relative flex min-h-[126px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-2 text-center transition-all duration-200 sm:min-h-[155px] sm:p-3 ${cell ? cell.team === 0 ? "border-emerald-400/70 bg-gradient-to-br from-emerald-500/15 to-slate-950 shadow-[0_0_24px_rgba(16,185,129,.18)]" : "border-sky-400/70 bg-gradient-to-br from-sky-500/15 to-slate-950 shadow-[0_0_24px_rgba(56,189,248,.16)]" : active ? "scale-[1.02] border-emerald-400 bg-emerald-400/10 shadow-[0_0_22px_rgba(16,185,129,.22)]" : "border-slate-700/80 bg-slate-950/75 hover:scale-[1.02] hover:border-emerald-500/80 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(16,185,129,.18)]"}`}>
                          {cell ? <>
                            <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${cell.team === 0 ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-sky-400/25 bg-sky-400/10 text-sky-100"}`}><Check size={10} /> Team {cell.team + 1}</span>
                            <span className={`mb-2 grid h-10 w-10 place-items-center rounded-full border text-xs font-black ${cell.team === 0 ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-50" : "border-sky-300/40 bg-sky-400/20 text-sky-50"}`}>{initials(cell.name)}</span>
                            <span className="max-w-full truncate text-[10px] font-extrabold text-white sm:text-xs">{cell.name}</span>
                            {clubName && <span className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-[8px] text-slate-400"><ClubCrest src={clubCrests[normalize(clubName)]} alt={`${clubName} crest`} className="h-5 w-5" fallbackClassName="h-3 w-3" /><span className="truncate">{clubName}</span></span>}
                          </> : <>
                            <span className={`grid h-9 w-9 place-items-center rounded-xl border transition ${active ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : "border-slate-700 bg-slate-900 text-slate-500 group-hover:border-emerald-400/35 group-hover:text-emerald-200"}`}><CircleHelp size={18} /></span>
                            <span className="mt-2 text-[9px] font-extrabold uppercase tracking-[.1em] text-slate-400 group-hover:text-white sm:text-[10px]">{active ? "Selected" : "Open tile"}</span>
                          </>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 backdrop-blur-xl">
            <p className="flex items-center gap-2 text-xs text-slate-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{cells.filter(Boolean).length} / 9 claimed</p>
            <p role="status" className="text-xs font-semibold text-slate-300">{message || `${currentLeague.season} competition · data snapshot ${DATA_AS_OF}`}</p>
            {!isRoomMatch && <button onClick={resetMatch} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold uppercase text-slate-300 transition hover:text-white"><RotateCcw size={12} /> Reset</button>}
          </div>
        </>
      )}

      {selected !== null && !matchFinished && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="grid-player-title" className="w-full max-w-xl rounded-3xl border border-emerald-400/25 bg-slate-900 p-5 shadow-[0_25px_100px_rgba(0,0,0,.65)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-300">Team {turn + 1} · tile claim</p>
                <h2 id="grid-player-title" className="mt-1 font-display text-xl font-black text-white">Find a matching player</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {[activeCriteria[selected].row, activeCriteria[selected].column].map((criterion) => <span key={`${criterion.type}-${criterion.value}`} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-[9px] font-bold text-slate-200"><CriterionIcon criterion={criterion} league={currentLeague} />{criterion.label}</span>)}
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close search" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"><X size={17} /></button>
            </div>
            <label htmlFor="matrix-player-search" className="mb-2 mt-5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Search eligible players</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input id="matrix-player-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a player name…" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10" />
              {query.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-1.5 shadow-2xl">
                  {eligiblePlayers.length ? eligiblePlayers.map((player) => {
                    const team = player.clubs?.find((name) => clubCrests[normalize(name)]) || player.clubs?.[0];
                    return <button key={player.name} type="button" onClick={() => claimTile(player)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-emerald-400/10"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-800 text-[10px] font-black text-white">{initials(player.name)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{player.name}</span><span className="block truncate text-[10px] text-slate-500">{team || player.countries?.[0] || "Footballer"}</span></span><CheckCircle2 className="shrink-0 text-emerald-300" size={16} /></button>;
                  }) : <p className="px-3 py-3 text-xs text-slate-500">No eligible player found for both criteria.</p>}
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3"><p className="text-[10px] text-slate-500">Players are checked against club, country, honors and manager records.</p><button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5">Cancel</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
