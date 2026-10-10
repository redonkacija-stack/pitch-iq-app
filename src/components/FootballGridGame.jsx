import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleHelp,
  Grid3X3,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { gridGrids, gridPlayers } from "../data/arcadeData";

function qualifies(player, row, column) {
  const norm = (s) => (s || "").toLowerCase();

  const matchesCriterion = (crit) => {
    const c = norm(crit);
    // Check trophies
    if (player.trophies?.some((t) => norm(t).includes(c) || c.includes(norm(t))))
      return true;
    // Check clubs
    if (player.clubs?.some((cl) => norm(cl).includes(c) || c.includes(norm(cl))))
      return true;
    // Check countries
    if (player.countries?.some((co) => norm(co).includes(c) || c.includes(norm(co))))
      return true;
    return false;
  };

  return matchesCriterion(row) && matchesCriterion(column);
}

export default function FootballGridGame({
  onBack,
  onComplete,
  initialGridIndex,
}) {
  const grids = gridGrids || [
    {
      id: "classic-1",
      title: "League Heavyweights & Global Nations",
      rows: ["Premier League", "La Liga", "Serie A"],
      columns: ["England", "France", "Brazil"],
    },
  ];

  const [gridIndex, setGridIndex] = useState(() =>
    initialGridIndex !== undefined
      ? initialGridIndex % grids.length
      : Math.floor(Math.random() * grids.length),
  );
  const activeGrid = grids[gridIndex % grids.length];

  const [cells, setCells] = useState(Array(9).fill(null));
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [turn, setTurn] = useState(0);
  const [finished, setFinished] = useState(false);

  const rowLabels = activeGrid.rows;
  const columnLabels = activeGrid.columns;

  // Filtered auto-complete suggestions
  const suggestions =
    query.trim().length >= 2
      ? gridPlayers
          .filter((p) =>
            p.name.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .slice(0, 5)
      : [];

  function selectCell(index) {
    if (cells[index] || finished) return;
    setSelected(index);
    setQuery("");
    setMessage("");
  }

  function handleClaim(playerName) {
    if (selected === null) return;
    const player = gridPlayers.find(
      (entry) => entry.name.toLowerCase() === playerName.trim().toLowerCase(),
    );

    const row = rowLabels[Math.floor(selected / 3)];
    const column = columnLabels[selected % 3];

    if (!player || !qualifies(player, row, column)) {
      setMessage(`"${playerName}" does not fit both "${row}" and "${column}".`);
      return;
    }

    if (cells.some((cell) => cell?.name === player.name)) {
      setMessage(`"${player.name}" has already been used on this grid.`);
      return;
    }

    const next = [...cells];
    next[selected] = { name: player.name, team: turn };
    setCells(next);
    setSelected(null);
    setQuery("");
    setMessage(`Valid! ${player.name} secured the square.`);

    // Check winning 3-in-a-row lines
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const winner = lines.find((line) =>
      line.every((i) => next[i]?.team === turn),
    );

    if (winner) {
      setFinished(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#38bdf8", "#eab308"],
      });
      onComplete?.(150, true);
    } else if (next.every(Boolean)) {
      setFinished(true);
      onComplete?.(75, false);
    } else {
      setTurn((prev) => (prev === 0 ? 1 : 0));
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

  function changeGrid(idx) {
    setGridIndex(idx);
    setCells(Array(9).fill(null));
    setSelected(null);
    setQuery("");
    setMessage("");
    setTurn(0);
    setFinished(false);
  }

  function shuffleGrid() {
    const nextIdx = (gridIndex + 1) % gridGrids.length;
    changeGrid(nextIdx);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-7">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft size={14} /> Back to Modes
          </button>
          <button
            onClick={shuffleGrid}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime"
            title="Randomize Matrix"
          >
            <Sparkles size={13} className="text-lime" /> Shuffle Matrix
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-lime/30 bg-lime/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime">
            Football Matrix
          </span>
          <span className="text-xs text-slate-400">• Tic-Tac-Toe Grid</span>
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          Tic-Tac-Toe Matrix Showdown
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Match rows and columns by naming players who fit both criteria. Play
          1v1 or solo to get 3-in-a-row.
        </p>
      </div>

      {/* Matrix Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141f34] p-4">
        <div className="flex items-center gap-2">
          <Grid3X3 size={16} className="text-lime" />
          <span className="text-xs font-bold text-white">Grid Challenge:</span>
          <select
            value={gridIndex}
            onChange={(e) => changeGrid(Number(e.target.value))}
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-lime/50"
          >
            {grids.map((g, i) => (
              <option key={g.id} value={i} className="bg-slate-900">
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Turn:</span>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              turn === 0
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border border-sky-500/40 bg-sky-500/10 text-sky-300"
            }`}
          >
            Team {turn + 1}
          </span>
        </div>
      </div>

      {/* The 3x3 Grid Matrix */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#141f34] p-5">
        <div className="min-w-[580px]">
          <div className="grid grid-cols-4 gap-3">
            {/* Top-left corner */}
            <div className="grid place-items-center rounded-xl bg-black/20 p-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              PitchIQ Matrix
            </div>

            {/* Column Headers */}
            {columnLabels.map((col) => (
              <div
                key={col}
                className="grid place-items-center rounded-xl border border-white/10 bg-black/30 p-3 text-center text-xs font-bold text-cyan-300"
              >
                {col}
              </div>
            ))}

            {/* Matrix Rows & Cells */}
            {rowLabels.map((row, ri) => (
              <div key={row} className="contents">
                {/* Row Header */}
                <div className="grid place-items-center rounded-xl border border-white/10 bg-black/30 p-3 text-center text-xs font-bold text-amber-200">
                  {row}
                </div>

                {/* 3 Cells in this row */}
                {[0, 1, 2].map((ci) => {
                  const idx = ri * 3 + ci;
                  const cell = cells[idx];
                  const isSelected = selected === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => selectCell(idx)}
                      disabled={Boolean(cell) || finished}
                      className={`group relative grid min-h-[120px] place-items-center rounded-xl border p-3 text-center transition ${
                        cell
                          ? cell.team === 0
                            ? "border-emerald-500/40 bg-emerald-500/10 shadow-inner"
                            : "border-sky-500/40 bg-sky-500/10 shadow-inner"
                          : isSelected
                            ? "border-lime bg-lime/10"
                            : "border-white/10 bg-black/20 hover:border-lime/30 hover:bg-white/[0.02]"
                      }`}
                    >
                      {cell ? (
                        <div>
                          <Check
                            size={18}
                            className={`mx-auto ${
                              cell.team === 0
                                ? "text-emerald-400"
                                : "text-sky-400"
                            }`}
                          />
                          <p className="mt-2 text-xs font-bold text-white">
                            {cell.name}
                          </p>
                          <span className="mt-1 inline-block rounded bg-black/30 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                            Team {cell.team + 1}
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-600 group-hover:text-slate-400">
                          <CircleHelp size={22} className="mx-auto" />
                          <span className="mt-1 block text-[10px]">
                            {isSelected ? "Selected" : "Empty Tile"}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Tile Input with Search Auto-complete */}
      {selected !== null && !finished && (
        <div className="rounded-2xl border border-lime/40 bg-[#111a2d] p-4">
          <div className="mb-2 text-xs font-bold text-lime">
            Claiming: {rowLabels[Math.floor(selected / 3)]} +{" "}
            {columnLabels[selected % 3]}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) handleClaim(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type player name (e.g. Thierry Henry, Cristiano Ronaldo)..."
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-lime/60"
              />

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d1524] shadow-2xl">
                  {suggestions.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleClaim(p.name)}
                      className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-lime/10 hover:text-lime"
                    >
                      <span>{p.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {p.countries?.join(", ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-lime px-5 py-2.5 text-xs font-bold text-ink hover:bg-lime/90"
            >
              Claim Tile
            </button>
          </form>
        </div>
      )}

      {/* Status & Results */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {message && (
          <p className="text-xs font-medium text-slate-300">{message}</p>
        )}
        {finished && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-lime">
              Game Finished! 3-in-a-row achieved.
            </span>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              <RotateCcw size={13} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
