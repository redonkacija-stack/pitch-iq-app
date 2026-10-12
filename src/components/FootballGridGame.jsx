import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleHelp,
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
import { gridGrids, gridPlayers } from "../data/arcadeData";

const leagueMarks = {
  "premier league": { short: "PL", color: "text-violet-200 border-violet-300/25 bg-violet-400/10" },
  "la liga": { short: "LL", color: "text-orange-200 border-orange-300/25 bg-orange-400/10" },
  "serie a": { short: "SA", color: "text-sky-200 border-sky-300/25 bg-sky-400/10" },
  bundesliga: { short: "BL", color: "text-rose-200 border-rose-300/25 bg-rose-400/10" },
};

const countryCodes = {
  argentina: "ar",
  brazil: "br",
  england: "gb-eng",
  france: "fr",
  germany: "de",
  netherlands: "nl",
  norway: "no",
  portugal: "pt",
  spain: "es",
  sweden: "se",
};

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
};

function normalize(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function qualifies(player, row, column) {
  const matchesCriterion = (criterion) => {
    const normalizedCriterion = normalize(criterion);
    return [
      ...(player.trophies || []),
      ...(player.clubs || []),
      ...(player.countries || []),
    ].some((value) => {
      const normalizedValue = normalize(value);
      return normalizedValue === normalizedCriterion ||
        normalizedValue.includes(normalizedCriterion) ||
        normalizedCriterion.includes(normalizedValue);
    });
  };
  return matchesCriterion(row) && matchesCriterion(column);
}

function CriterionMark({ label, compact = false }) {
  const normalized = normalize(label);
  const club = Object.keys(clubCrests).find((name) => normalized.includes(name));
  const country = Object.keys(countryCodes).find((name) => normalized === name);
  const league = Object.entries(leagueMarks).find(([name]) => normalized.includes(name));
  const trophy = normalized.includes("champions league") || normalized.includes("winner");
  const markClass = compact ? "h-8 w-8" : "h-10 w-10";

  if (club) return <ClubCrest src={clubCrests[club]} alt={`${label} crest`} className={markClass} />;
  if (country) return <FlagIcon code={countryCodes[country]} label={`${label} flag`} className={`${compact ? "h-5 w-8" : "h-6 w-9"} rounded border border-white/15 shadow-lg`} />;
  if (league) {
    return (
      <span className={`grid ${markClass} place-items-center rounded-xl border text-[10px] font-black tracking-tight ${league[1].color}`} aria-label={`${label} badge`}>
        {league[1].short}
      </span>
    );
  }
  if (trophy) return <span className={`grid ${markClass} place-items-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-amber-200`}><Trophy size={compact ? 16 : 19} aria-hidden="true" /></span>;
  return <span className={`grid ${markClass} place-items-center rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300`}><Shield size={compact ? 16 : 19} aria-hidden="true" /></span>;
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function FootballGridGame({ onBack, onComplete, initialGridIndex }) {
  const grids = gridGrids?.length ? gridGrids : [{
    id: "classic-1",
    title: "League Heavyweights & Global Nations",
    rows: ["Premier League", "La Liga", "Serie A"],
    columns: ["England", "France", "Brazil"],
  }];
  const [gridIndex, setGridIndex] = useState(() =>
    initialGridIndex !== undefined ? initialGridIndex % grids.length : Math.floor(Math.random() * grids.length),
  );
  const [cells, setCells] = useState(Array(9).fill(null));
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [turn, setTurn] = useState(0);
  const [finished, setFinished] = useState(false);
  const activeGrid = grids[gridIndex % grids.length];
  const rowLabels = activeGrid.rows;
  const columnLabels = activeGrid.columns;

  const suggestions = useMemo(() => {
    const search = normalize(query.trim());
    if (search.length < 2) return [];
    return gridPlayers
      .filter((player) => normalize(player.name).includes(search))
      .slice(0, 6);
  }, [query]);

  function selectCell(index) {
    if (cells[index] || finished) return;
    setSelected(index);
    setQuery("");
    setMessage("");
  }

  function handleClaim(playerName) {
    if (selected === null) return;
    const player = gridPlayers.find((entry) => normalize(entry.name) === normalize(playerName.trim()));
    const row = rowLabels[Math.floor(selected / 3)];
    const column = columnLabels[selected % 3];

    if (!player || !qualifies(player, row, column)) {
      setMessage(`That player does not fit both ${row} and ${column}.`);
      return;
    }
    if (cells.some((cell) => cell?.name === player.name)) {
      setMessage(`${player.name} has already been used on this matrix.`);
      return;
    }

    const next = [...cells];
    next[selected] = { ...player, team: turn };
    setCells(next);
    setSelected(null);
    setQuery("");
    setMessage(`${player.name} claimed the tile for Team ${turn + 1}.`);

    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    const winner = lines.find((line) => line.every((index) => next[index]?.team === turn));
    if (winner) {
      setFinished(true);
      setMessage(`Team ${turn + 1} completed a three-in-a-row.`);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ["#22c55e", "#38bdf8", "#eab308"] });
      onComplete?.(150, true);
    } else if (next.every(Boolean)) {
      setFinished(true);
      setMessage("The matrix is full. It’s a draw.");
      onComplete?.(75, false);
    } else {
      setTurn((previous) => previous === 0 ? 1 : 0);
    }
  }

  function reset() {
    setCells(Array(9).fill(null));
    setSelected(null);
    setQuery("");
    setMessage("");
    setTurn(0);
    setFinished(false);
  }

  function changeGrid(index) {
    setGridIndex(index);
    reset();
  }

  function shuffleGrid() {
    changeGrid((gridIndex + 1) % grids.length);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-7">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95">
            <ArrowLeft size={14} /> Back to Modes
          </button>
          <button onClick={shuffleGrid} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-400/10 active:scale-95">
            <Sparkles size={14} /> Shuffle Matrix
          </button>
        </div>
        <div className="rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/30 p-5 shadow-2xl sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-200">
                <Grid3X3 size={13} /> Football Matrix
              </span>
              <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">Tic-Tac-Toe Matrix Showdown</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Claim a square with a player who matches its row and column. Connect three tiles to win the match.</p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 ${turn === 0 ? "border-emerald-400/30 bg-emerald-400/10" : "border-sky-400/30 bg-sky-400/10"}`}>
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Active side</p>
              <p className={`mt-1 text-sm font-extrabold uppercase tracking-wider ${turn === 0 ? "text-emerald-200" : "text-sky-200"}`}>Team {turn + 1}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Choose matrix challenge">
            {grids.map((grid, index) => (
              <button key={grid.id} type="button" aria-pressed={gridIndex === index} onClick={() => changeGrid(index)} className={`rounded-lg border px-3 py-2 text-left text-[10px] font-bold transition ${gridIndex === index ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white"}`}>
                {grid.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-700/70 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_55%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:p-5" aria-label="Football matrix board">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {columnLabels.map((column) => (
            <div key={column} className="flex min-h-[78px] items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/75 p-2.5 shadow-lg backdrop-blur-xl sm:min-h-[90px] sm:gap-3 sm:p-3.5">
              <CriterionMark label={column} compact />
              <span className="text-[10px] font-extrabold uppercase leading-tight tracking-wide text-slate-100 sm:text-xs">{column}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-4 md:mt-4 md:space-y-5">
          {rowLabels.map((row, rowIndex) => (
            <div key={row}>
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-950/70 px-3 py-2 sm:mb-3 sm:px-4">
                <CriterionMark label={row} compact />
                <span className="text-[10px] font-extrabold uppercase tracking-[.13em] text-amber-100 sm:text-xs">{row}</span>
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-slate-500">Row {rowIndex + 1}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[0, 1, 2].map((columnIndex) => {
                  const index = rowIndex * 3 + columnIndex;
                  const cell = cells[index];
                  const isSelected = selected === index;
                  const sideTone = cell?.team === 0 ? "emerald" : "sky";
                  const club = cell?.clubs?.find((name) => clubCrests[normalize(name)]) || cell?.clubs?.[0];
                  return (
                    <button key={index} type="button" onClick={() => selectCell(index)} disabled={Boolean(cell) || finished} aria-label={`${row} and ${columnLabels[columnIndex]}${cell ? `, claimed by ${cell.name}` : ", open tile"}`} className={`group relative flex min-h-[132px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-2 text-center transition-all duration-200 sm:min-h-[160px] sm:p-3 ${cell ? sideTone === "emerald" ? "border-emerald-400/70 bg-gradient-to-br from-emerald-500/15 to-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.18)]" : "border-sky-400/70 bg-gradient-to-br from-sky-500/15 to-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.16)]" : isSelected ? "scale-[1.02] border-emerald-400 bg-emerald-400/10 shadow-[0_0_22px_rgba(16,185,129,0.22)]" : "border-slate-700/80 bg-slate-950/70 hover:scale-[1.02] hover:border-emerald-500/80 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(16,185,129,0.16)] disabled:cursor-default"}`}>
                      {cell ? (
                        <>
                          <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${cell.team === 0 ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-sky-400/25 bg-sky-400/10 text-sky-200"}`}><Check size={10} /> Team {cell.team + 1}</span>
                          <span className={`mb-2 grid h-10 w-10 place-items-center rounded-full border text-xs font-black shadow-lg sm:h-12 sm:w-12 ${cell.team === 0 ? "border-emerald-300/35 bg-gradient-to-br from-emerald-300/30 to-emerald-950 text-emerald-50" : "border-sky-300/35 bg-gradient-to-br from-sky-300/30 to-sky-950 text-sky-50"}`}>{initials(cell.name)}</span>
                          <p className="max-w-full truncate text-[10px] font-extrabold text-white sm:text-xs">{cell.name}</p>
                          <span className="mt-1 inline-flex max-w-full items-center gap-1 text-[8px] text-slate-400 sm:text-[9px]">
                            {club && <ClubCrest src={clubCrests[normalize(club)]} alt={`${club} crest`} className="h-5 w-5" fallbackClassName="h-3 w-3" />}
                            <span className="truncate">{club || "Verified player"}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={`grid h-9 w-9 place-items-center rounded-xl border transition ${isSelected ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : "border-slate-700 bg-slate-900 text-slate-500 group-hover:border-emerald-400/35 group-hover:text-emerald-200"}`}><CircleHelp size={18} /></span>
                          <span className="mt-2 text-[9px] font-extrabold uppercase tracking-[.1em] text-slate-400 group-hover:text-white sm:text-[10px]">{isSelected ? "Tile Selected" : "Open Tile"}</span>
                          <span className="mt-1 hidden text-[8px] text-slate-600 sm:block">{row} + {columnLabels[columnIndex]}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{cells.filter(Boolean).length} / 9 tiles claimed</div>
        {message && <p role="status" className="text-xs font-semibold text-slate-200">{message}</p>}
        {finished && <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-95"><RotateCcw size={13} /> Play Again</button>}
      </div>

      {selected !== null && !finished && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="claim-tile-title" className="w-full max-w-xl rounded-3xl border border-emerald-400/25 bg-slate-900 p-5 shadow-[0_25px_100px_rgba(0,0,0,0.65)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-300">Team {turn + 1} · Player claim</span>
                <h2 id="claim-tile-title" className="mt-1 font-display text-xl font-black text-white sm:text-2xl">Find a player for this tile</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[.08] px-3 py-1.5 text-[10px] font-bold text-amber-100"><CriterionMark label={rowLabels[Math.floor(selected / 3)]} compact />{rowLabels[Math.floor(selected / 3)]}</span>
                  <span className="text-slate-500">+</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/[.08] px-3 py-1.5 text-[10px] font-bold text-sky-100"><CriterionMark label={columnLabels[selected % 3]} compact />{columnLabels[selected % 3]}</span>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close player search" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"><X size={17} /></button>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); if (query.trim()) handleClaim(query); }} className="mt-5">
              <label htmlFor="grid-player-search" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Search eligible players</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input id="grid-player-search" autoFocus type="text" value={query} onChange={(event) => { setQuery(event.target.value); setMessage(""); }} placeholder="Start typing a player name…" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10" />
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-1.5 shadow-2xl">
                    {suggestions.map((player) => {
                      const fits = qualifies(player, rowLabels[Math.floor(selected / 3)], columnLabels[selected % 3]);
                      const club = player.clubs?.find((name) => clubCrests[normalize(name)]) || player.clubs?.[0];
                      return (
                        <button key={player.name} type="button" onClick={() => handleClaim(player.name)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-emerald-400/10">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-800 text-[10px] font-black text-slate-200">{initials(player.name)}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{player.name}</span><span className="block truncate text-[10px] text-slate-500">{club || player.countries?.[0] || "Footballer"}</span></span>
                          {fits ? <CheckCircle2 className="shrink-0 text-emerald-300" size={16} /> : <span className="shrink-0 text-[9px] font-bold uppercase text-slate-600">No match</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {message ? <p role="status" className="text-xs font-semibold text-rose-300">{message}</p> : <p className="text-[10px] text-slate-500">A player must match both criteria and can only be used once.</p>}
                <button type="submit" disabled={!query.trim()} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">Claim tile</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
