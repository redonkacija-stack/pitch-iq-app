export default function PitchCanvas({
  players,
  guessed,
  selectedId,
  onSelect,
}) {
  return (
    <div className="pitch-surface pitch-lines relative mx-auto hidden aspect-[1.22/1] w-full max-w-[590px] overflow-hidden rounded-xl border border-white/20 shadow-2xl sm:block">
      <div className="absolute inset-2 rounded-lg border border-white/20" />
      <div className="absolute left-1/2 top-1/2 h-[19%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-white/20" />
      {players.map((player, index) => {
        const isKnown = guessed.has(player.id);
        const isSelected = selectedId === player.id;
        return (
          <button
            key={player.id}
            onClick={() => !isKnown && onSelect(player.id)}
            className={`lineup-slot absolute z-10 flex w-[76px] flex-col items-center gap-1 sm:w-[88px] ${isKnown ? "animate-pop-in" : "group"}`}
            style={{
              left: `${player.x}%`,
              top: `${player.y}%`,
              animationDelay: `${index * 20}ms`,
            }}
            aria-label={
              isKnown
                ? `${player.position}: ${player.name}`
                : `${player.position}, number ${player.number}, select position`
            }
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full border text-[11px] font-extrabold shadow-lg transition sm:h-9 sm:w-9 ${isKnown ? "border-lime bg-lime text-ink" : isSelected ? "scale-110 border-lime bg-lime/15 text-lime" : "border-white/60 bg-[#0f172a]/90 text-white group-hover:scale-110 group-hover:border-lime group-hover:text-lime"}`}
            >
              {isKnown ? "✓" : player.number}
            </span>
            <span
              className="rounded-full border border-white/25 bg-[#0f172a]/85 px-1.5 py-0.5 text-[10px] leading-none"
              title="Nationality"
            >
              {player.flag}
            </span>
            <span
              className={`max-w-full truncate rounded bg-[#0f172a]/85 px-1.5 py-1 text-center text-[10px] font-bold leading-tight text-white sm:text-[11px] ${isKnown ? "border border-lime/30" : isSelected ? "outline outline-1 outline-lime/50" : ""}`}
            >
              {isKnown ? player.name : player.position}
            </span>
          </button>
        );
      })}
    </div>
  );
}
