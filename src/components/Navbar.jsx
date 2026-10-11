import {
  Award,
  CircleHelp,
  House,
  Shield,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function Navbar({
  activeMode,
  soundEnabled,
  onHome,
  onSelectMode,
  onStats,
  onSoundChange,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 shadow-lg shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex h-[62px] max-w-[1280px] items-center justify-between px-4 sm:px-7 lg:px-10">
        <button
          onClick={onHome}
          className="flex items-center gap-2.5 text-left"
          aria-label="PitchIQ home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-lime font-display text-lg font-extrabold text-ink">
            P
          </span>
          <span>
            <span className="font-display text-[21px] font-extrabold uppercase leading-none tracking-[0]">
              Pitch<span className="text-lime">IQ</span>
            </span>
            <span className="mt-0.5 hidden text-[9px] font-bold uppercase tracking-[.16em] text-mist sm:block">
              Football intelligence, in play
            </span>
          </span>
        </button>
        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label="Main navigation"
        >
          <button
            onClick={onHome}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${activeMode === "home" ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.05] hover:text-white"}`}
          >
            <House size={15} /> Hub
          </button>
          <button
            onClick={() => onSelectMode("lineup")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${activeMode === "lineup" ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.05] hover:text-white"}`}
          >
            <Shield size={15} /> Starting XI
          </button>
          <button
            onClick={() => onSelectMode("transfer")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${activeMode === "transfer" ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.05] hover:text-white"}`}
          >
            <Shuffle size={15} /> Career
          </button>
          <button
            onClick={() => onSelectMode("tactics")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${activeMode === "tactics" ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.05] hover:text-white"}`}
          >
            <CircleHelp size={15} /> Tactics
          </button>
          <button
            onClick={onStats}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-mist transition hover:bg-white/[.05] hover:text-white"
          >
            <Award size={15} /> Stats
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSoundChange(!soundEnabled)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[.08] text-mist transition hover:border-lime/30 hover:text-lime"
            aria-label={
              soundEnabled ? "Mute sound effects" : "Enable sound effects"
            }
            title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button
            onClick={onStats}
            className="grid h-9 w-9 place-items-center rounded-lg border border-lime/20 bg-lime/10 text-lime transition hover:bg-lime/20 sm:hidden"
            aria-label="Open achievements"
          >
            <Award size={16} />
          </button>
          <span className="hidden rounded-full border border-lime/20 bg-lime/[.07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-lime md:inline">
            Season 01
          </span>
        </div>
      </div>
      <nav
        className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto border-t border-white/[.05] px-3 py-1.5 sm:hidden"
        aria-label="Game modes"
      >
        {[
          { id: "home", label: "Hub", icon: House, action: onHome },
          {
            id: "lineup",
            label: "XI",
            icon: Shield,
            action: () => onSelectMode("lineup"),
          },
          {
            id: "transfer",
            label: "Career",
            icon: Shuffle,
            action: () => onSelectMode("transfer"),
          },
          {
            id: "tactics",
            label: "Tactics",
            icon: CircleHelp,
            action: () => onSelectMode("tactics"),
          },
        ].map(({ id, label, icon: Icon, action }) => (
          <button
            key={id}
            onClick={action}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-[11px] font-semibold transition ${activeMode === id ? "bg-white/[.08] text-white" : "text-mist hover:bg-white/[.05] hover:text-white"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
