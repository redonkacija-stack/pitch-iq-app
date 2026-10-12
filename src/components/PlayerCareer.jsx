import { useMemo, useState } from "react";
import { allLeagueClubs, allLeaguePlayers, leagues2026_2027 } from "../data/leagues2026_2027";

const SAVE_KEY = "pitchiq-player-career-v1";
const readSave = () => {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch { return null; }
};
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const panel = "rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur";

export default function PlayerCareer({ onBack }) {
  const [career, setCareer] = useState(readSave);
  const [kind, setKind] = useState("custom");
  const [playerId, setPlayerId] = useState(allLeaguePlayers[0]?.id || "");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("MID");
  const [clubId, setClubId] = useState(allLeagueClubs[0]?.id || "");
  const [leagueId, setLeagueId] = useState(leagues2026_2027[0]?.id || "");

  const selectedLeague = leagues2026_2027.find((league) => league.id === leagueId) || leagues2026_2027[0];
  const selectedPlayer = allLeaguePlayers.find((player) => player.id === playerId);
  const selectedClub = allLeagueClubs.find((club) => club.id === clubId);
  const currentRating = career ? Math.min(99, career.baseRating + Math.floor(career.xp / 150)) : 0;
  const offers = useMemo(() => {
    if (!career?.offers?.length) return [];
    return career.offers.map((id) => allLeagueClubs.find((club) => club.id === id)).filter(Boolean);
  }, [career?.offers]);

  function save(next) {
    setCareer(next);
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  }
  function startCareer() {
    if (!selectedClub || (kind === "custom" && !name.trim()) || (kind === "pro" && !selectedPlayer)) return;
    const player = kind === "pro" ? selectedPlayer : null;
    const next = { playerName: player?.name || name.trim(), position: player?.position || position, clubId: selectedClub.id, season: 1, matchday: 0, xp: 0, baseRating: player?.rating || 65, appearances: 0, wins: 0, draws: 0, losses: 0, offers: [], transferHistory: [], trophies: [] };
    save(next);
  }
  function playMatch() {
    const result = Math.random();
    const outcome = result > 0.65 ? "win" : result > 0.3 ? "draw" : "loss";
    const xp = outcome === "win" ? 60 : outcome === "draw" ? 35 : 20;
    const matchday = career.matchday + 1;
    const next = { ...career, matchday, xp: career.xp + xp, appearances: career.appearances + 1, wins: career.wins + (outcome === "win" ? 1 : 0), draws: career.draws + (outcome === "draw" ? 1 : 0), losses: career.losses + (outcome === "loss" ? 1 : 0), lastResult: outcome };
    if (matchday >= 10) {
      const minTier = currentRating >= 90 && (Math.floor(next.xp / 100) + 1) >= 8 ? 3 : currentRating >= 82 ? 2 : 1;
      const candidates = allLeagueClubs.filter((club) => club.id !== career.clubId && club.tier <= minTier && (minTier === 3 ? club.tier >= 2 : true));
      next.offers = candidates.sort(() => Math.random() - 0.5).slice(0, 4).map((club) => club.id);
    }
    save(next);
  }
  function startNextSeason(nextClubId = career.clubId) {
    const trophies = nextClubId === career.clubId && career.wins >= 7 ? [...career.trophies, `Season ${career.season} Player of the Season`] : career.trophies;
    save({ ...career, clubId: nextClubId, season: career.season + 1, matchday: 0, offers: [], trophies, transferHistory: nextClubId === career.clubId ? career.transferHistory : [...career.transferHistory, { from: career.clubId, to: nextClubId, season: career.season + 1 }] });
  }

  if (!career) return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 text-white">
    <button onClick={onBack} className="text-sm text-slate-400 hover:text-white">← Back to Hub</button>
    <section className={`${panel} space-y-5`}>
      <div><p className="text-xs font-bold uppercase tracking-widest text-lime">PitchIQ · Player journey</p><h1 className="mt-2 text-3xl font-black">Player Career</h1><p className="mt-2 text-sm text-slate-400">Build a career across the 2026/27 top five leagues. Match results, XP and transfers are saved on this device.</p></div>
      <div className="flex gap-2"><button onClick={() => setKind("custom")} className={`rounded-xl px-4 py-2 ${kind === "custom" ? "bg-lime text-slate-950" : "bg-slate-800"}`}>Custom Wonderkid</button><button onClick={() => setKind("pro")} className={`rounded-xl px-4 py-2 ${kind === "pro" ? "bg-lime text-slate-950" : "bg-slate-800"}`}>Real Pro</button></div>
      {kind === "custom" ? <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Player name<input value={name} maxLength={32} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white" placeholder="Your player name" /></label><label className="text-sm text-slate-300">Position<select value={position} onChange={(event) => setPosition(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white">{["GK", "DEF", "MID", "ATT"].map((item) => <option key={item}>{item}</option>)}</select></label></div> : <label className="block text-sm text-slate-300">Choose a real pro<select value={playerId} onChange={(event) => setPlayerId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white">{allLeaguePlayers.map((player) => <option key={player.id} value={player.id}>{player.name} · {player.club} · {player.rating} OVR</option>)}</select><span className="mt-1 block text-xs text-slate-500">This list contains players with representative roster data in the catalog.</span></label>}
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">League<select value={leagueId} onChange={(event) => { const league = leagues2026_2027.find((entry) => entry.id === event.target.value); setLeagueId(league.id); setClubId(league.clubs[0]?.id); }} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white">{leagues2026_2027.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}</select></label><label className="text-sm text-slate-300">Starting club<select value={clubId} onChange={(event) => setClubId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white">{selectedLeague.clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label></div>
      <button onClick={startCareer} className="rounded-xl bg-lime px-5 py-3 font-bold text-slate-950">Start Career</button>
    </section>
  </main>;

  const club = allLeagueClubs.find((entry) => entry.id === career.clubId);
  const level = Math.floor(career.xp / 100) + 1;
  const winRate = career.appearances ? Math.round(career.wins / career.appearances * 100) : 0;
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 text-white">
    <button onClick={onBack} className="text-sm text-slate-400 hover:text-white">← Back to Hub</button>
    <section className={`${panel} flex flex-wrap items-center justify-between gap-5`}><div><p className="text-xs font-bold uppercase tracking-widest text-lime">Season {career.season} · Matchday {career.matchday} of 10</p><h1 className="mt-2 text-3xl font-black">{career.playerName}</h1><p className="mt-1 text-slate-400">{club?.name} · {club?.league} · {career.position}</p></div><div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-slate-950 px-4 py-3"><b className="text-xl">{currentRating}</b><p className="text-xs text-slate-500">OVR</p></div><div className="rounded-xl bg-slate-950 px-4 py-3"><b className="text-xl">{level}</b><p className="text-xs text-slate-500">Level</p></div><div className="rounded-xl bg-slate-950 px-4 py-3"><b className="text-xl">{winRate}%</b><p className="text-xs text-slate-500">Win rate</p></div></div></section>
    {career.matchday < 10 ? <section className={`${panel} flex flex-wrap items-center justify-between gap-4`}><div><h2 className="text-lg font-bold">Next match</h2><p className="mt-1 text-sm text-slate-400">Play a simulated fixture to earn XP and improve your overall rating.</p>{career.lastResult && <p className="mt-2 text-sm text-lime">Last result: {career.lastResult}</p>}</div><button onClick={playMatch} className="rounded-xl bg-lime px-5 py-3 font-bold text-slate-950">Play Matchday {career.matchday + 1}</button></section> : <section className={`${panel} space-y-4`}><h2 className="text-xl font-bold">Season {career.season} complete</h2><p className="text-sm text-slate-400">{career.wins} wins · {career.draws} draws · {career.losses} losses · {career.xp} XP</p><h3 className="font-semibold">Transfer offers</h3><div className="grid gap-3 sm:grid-cols-2">{offers.map((offer) => <article key={offer.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="font-bold">{offer.name}</p><p className="text-xs text-slate-500">{offer.league} · Tier {offer.tier}</p><button onClick={() => startNextSeason(offer.id)} className="mt-3 rounded-lg bg-lime px-3 py-2 text-sm font-bold text-slate-950">Accept offer</button></article>)}</div><button onClick={() => startNextSeason()} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Stay at {club?.name} · Start next season</button></section>}
    <section className={`${panel} grid gap-5 sm:grid-cols-2`}><div><h2 className="font-bold">Career record</h2><p className="mt-2 text-sm text-slate-400">{career.appearances} appearances · {career.wins} wins · {career.draws} draws · {career.losses} losses</p><p className="mt-1 text-sm text-slate-500">{career.xp} XP · {career.transferHistory.length} transfers</p></div><div><h2 className="font-bold">Trophy cabinet</h2><p className="mt-2 text-sm text-slate-400">{career.trophies.length ? career.trophies.join(" · ") : "No trophies yet. Complete a strong season to earn your first."}</p></div></section>
    <button onClick={() => { localStorage.removeItem(SAVE_KEY); setCareer(null); }} className="text-xs text-slate-600 hover:text-rose-300">Reset player career</button>
  </main>;
}
