import { Award, Home, Swords, Volume2, VolumeX } from "lucide-react";

export default function GameNavbar({
  activeMode,
  onHome,
  onLobby,
  onStats,
  soundEnabled,
  onSoundChange,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[.07] bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
        <button
          onClick={onHome}
          className="flex items-center gap-2.5"
          aria-label="PitchIQ game hub"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime font-display text-lg font-black text-ink">
            P
          </span>
          <span className="font-display text-xl font-extrabold uppercase">
            Pitch<span className="text-lime">IQ</span>
            <span className="ml-2 hidden text-[9px] font-bold tracking-[.16em] text-slate-500 sm:inline">
              FOOTBALL ARCADE
            </span>
          </span>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={onHome}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeMode === "home" ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.04] hover:text-white"}`}
          >
            <Home size={15} /> Hub
          </button>
          <button
            onClick={onLobby}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeMode === "lobby" ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.04] hover:text-white"}`}
          >
            <Swords size={15} /> Versus lobby
          </button>
          <button
            onClick={onStats}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-mist hover:bg-white/[.04] hover:text-white"
          >
            <Award size={15} /> Stats
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSoundChange(!soundEnabled)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-mist hover:text-lime"
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={onLobby}
            className="inline-flex items-center gap-2 rounded-lg bg-lime px-3 py-2.5 text-xs font-bold text-ink hover:bg-lime/90 md:hidden"
          >
            <Swords size={14} /> Versus
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/[.05] px-3 py-1.5 md:hidden">
        <button
          onClick={onHome}
          className="flex min-w-16 flex-1 justify-center rounded-md px-2 py-2 text-xs text-slate-300"
        >
          Hub
        </button>
        <button
          onClick={onLobby}
          className="flex min-w-24 flex-1 justify-center rounded-md px-2 py-2 text-xs text-slate-300"
        >
          Versus lobby
        </button>
        <button
          onClick={onStats}
          className="flex min-w-16 flex-1 justify-center rounded-md px-2 py-2 text-xs text-slate-300"
        >
          Stats
        </button>
      </nav>
    </header>
  );
}
