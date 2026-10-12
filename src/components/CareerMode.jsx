import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  Medal,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { careers, matches, profiles } from "../data/gameData";
import {
  gridPlayers,
  gridCriteriaForCell,
  leagueOptions,
  playerMatchesGridCriterion,
  playerMatchesGridCell,
} from "../data/gridData";

const STORAGE_KEY = "pitchiq-career-mode-v1";
const SEASON_MATCHDAYS = 10;
const MATCH_TIME_LIMIT = 40;
const LOWER_LEAGUE_CLUBS = [
  "Wrexham AFC", "Coventry City", "Norwich City", "Stoke City", "Swansea City",
  "Preston North End", "Blackburn Rovers", "Bristol City", "Portsmouth", "Middlesbrough",
  "Birmingham City", "Sheffield Wednesday", "Oxford United", "Derby County", "Millwall",
  "Queens Park Rangers", "Charlton Athletic", "Bolton Wanderers", "Huddersfield Town", "Reading",
  "Bradford City", "Stockport County", "Leyton Orient", "Barnsley", "Mansfield Town",
  "Wycombe Wanderers", "Peterborough United", "Luton Town", "Cardiff City", "Plymouth Argyle",
  "Hull City", "West Bromwich Albion", "Blackpool", "Lincoln City", "Wigan Athletic",
  "Rotherham United", "Doncaster Rovers", "Burton Albion", "Exeter City", "Stevenage",
];
const PROMOTION_OFFERS = [
  "FC Barcelona", "Real Madrid", "Bayern Munich", "Manchester City", "Liverpool FC", "Paris Saint-Germain",
  "Arsenal", "Chelsea", "Inter Milan", "Juventus", "AC Milan", "Borussia Dortmund",
  "Atlético Madrid", "Ajax", "Benfica", "FC Porto", "Tottenham Hotspur", "Napoli",
];
const TROPHY_NAMES = ["Tier 1 League Champions", "Champions League Winners"];
const UCL_ROUNDS = ["Quarter-final", "Semi-final", "Final"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const initials = (name) => name.split(/\s+/).map((word) => word[0]).slice(0, 3).join("").toUpperCase();

function seededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function makeOptions(answer, pool, random) {
  const distinct = [...new Set(pool.filter((value) => value && value !== answer))];
  return shuffle([answer, ...shuffle(distinct, random).slice(0, 3)], random);
}

function buildChallenge(season, matchday) {
  const random = seededRandom(season * 101 + matchday * 7919);
  const typeIndex = (matchday - 1) % 4;

  if (typeIndex === 0 && matches.length) {
    const lineupPool = matches.filter((item) => item.formation && item.players?.length >= 8);
    const match = lineupPool[Math.floor(random() * lineupPool.length)];
    const players = match.players || [];
    const target = players[Math.floor(random() * players.length)];
    const position = target.position;
    const comparablePlayers = matches.flatMap((item) => (item.players || []).filter((player) => player.position === position && player.name).map((player) => player.name));
    const comparableNumbers = matches.flatMap((item) => (item.players || []).filter((player) => player.position === position && player.number != null).map((player) => String(player.number)));
    return {
      mode: "Guess the Lineup",
      questions: [
        { prompt: `In ${match.title || `${match.team} vs ${match.opponent}`}, who started at ${position}?`, answer: target.name, options: makeOptions(target.name, comparablePlayers, random) },
        { prompt: `What shirt number did ${target.name} wear in that ${match.formation} lineup?`, answer: String(target.number), options: makeOptions(String(target.number), comparableNumbers, random) },
      ],
    };
  }

  if (typeIndex === 1 && careers.length) {
    const pool = careers.filter((item) => item.answer && item.clubs?.length >= 3);
    const career = pool[Math.floor(random() * pool.length)];
    const clubs = career.clubs.map((clubItem) => clubItem.name).filter(Boolean);
    const nextClubIndex = 1 + Math.floor(random() * (clubs.length - 1));
    const previousClub = clubs[nextClubIndex - 1];
    const nextClub = clubs[nextClubIndex];
    const players = [...new Set(careers.map((item) => item.answer).filter(Boolean))];
    const clubNames = [...new Set(careers.flatMap((item) => item.clubs || []).map((clubItem) => clubItem.name).filter(Boolean))];
    return {
      mode: "Transfer Chain",
      questions: [
        { prompt: `Which player moved directly from ${previousClub} to ${nextClub}?`, answer: career.answer, options: makeOptions(career.answer, players, random) },
        { prompt: `Which club did ${career.answer} leave immediately before joining ${nextClub}?`, answer: previousClub, options: makeOptions(previousClub, clubNames, random) },
      ],
    };
  }

  if (typeIndex === 2 && profiles.length) {
    const profile = profiles[Math.floor(random() * profiles.length)];
    const managers = [...new Set(profiles.map((item) => item.answer).filter(Boolean))];
    const principles = [...new Set(profiles.flatMap((item) => item.principles || []).filter(Boolean))];
    return {
      mode: "Tactical Breakdown",
      questions: [
        { prompt: `Which manager uses the ${profile.systemName || "described system"} with this principle: “${profile.principles?.[0]}”`, answer: profile.answer, options: makeOptions(profile.answer, [...(profile.options || []), ...managers], random) },
        { prompt: `Which principle also belongs to ${profile.answer}'s tactical approach?`, answer: profile.principles?.[1] || profile.principles?.[0], options: makeOptions(profile.principles?.[1] || profile.principles?.[0], principles, random) },
      ],
    };
  }

  const cells = [];
  for (const league of leagueOptions) {
    for (let index = 0; index < 9; index += 1) {
      const criteria = gridCriteriaForCell(league, index);
      const validPlayers = gridPlayers.filter((player) => playerMatchesGridCell(player, league, index));
      if (criteria && validPlayers.length >= 4) cells.push({ league, criteria, validPlayers, index });
    }
  }
  if (cells.length) {
    const selectedCells = shuffle(cells, random).slice(0, 2);
    const questions = selectedCells.map(({ league, criteria, validPlayers, index }) => {
      const answer = validPlayers[Math.floor(random() * validPlayers.length)].name;
      const answerIsValid = (player) => playerMatchesGridCell(player, league, index);
      const closeDistractors = gridPlayers
        .filter((player) => player.name !== answer && !answerIsValid(player) && (playerMatchesGridCriterion(player, criteria.row) || playerMatchesGridCriterion(player, criteria.column)))
        .map((player) => player.name);
      const otherDistractors = gridPlayers.filter((player) => player.name !== answer && !answerIsValid(player)).map((player) => player.name);
      return {
        prompt: `Which player satisfies both ${criteria.row.label} and ${criteria.column.label} for the ${league.name} grid?`,
        answer,
        options: makeOptions(answer, [...closeDistractors, ...otherDistractors], random),
      };
    });
    return { mode: "Tic-Tac-Toe Grid", questions };
  }

  const profile = profiles[Math.floor(random() * profiles.length)];
  const managers = [...new Set(profiles.map((item) => item.answer).filter(Boolean))];
  return {
    mode: "Tactical Breakdown",
    questions: [
      { prompt: `Who manages ${profile.team || "this team"}?`, answer: profile.answer, options: makeOptions(profile.answer, managers, random) },
      { prompt: `Which formation does the system use?`, answer: profile.formation, options: makeOptions(profile.formation, profiles.map((item) => item.formation), random) },
    ],
  };
}

function makeFixtures(clubs) {
  const rotating = [...clubs];
  const rounds = [];
  for (let round = 0; round < 9; round += 1) {
    const fixtures = [];
    for (let index = 0; index < rotating.length / 2; index += 1) {
      const first = rotating[index];
      const second = rotating[rotating.length - 1 - index];
      fixtures.push(round % 2 ? { home: second, away: first } : { home: first, away: second });
    }
    rounds.push(fixtures);
    rotating.splice(1, 0, rotating.pop());
  }
  rounds.push(rounds[0].map(({ home, away }) => ({ home: away, away: home })));
  return rounds;
}

function makeStandings(clubs, results, currentClub) {
  const table = Object.fromEntries(clubs.map((club) => [club, { club, points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }]));
  for (const round of results) {
    for (const fixture of round) {
      if (fixture.homeScore == null || fixture.awayScore == null) continue;
      const home = table[fixture.home];
      const away = table[fixture.away];
      if (!home || !away) continue;
      home.played += 1; away.played += 1;
      home.goalsFor += fixture.homeScore; home.goalsAgainst += fixture.awayScore;
      away.goalsFor += fixture.awayScore; away.goalsAgainst += fixture.homeScore;
      if (fixture.homeScore > fixture.awayScore) { home.wins += 1; home.points += 3; away.losses += 1; }
      else if (fixture.homeScore < fixture.awayScore) { away.wins += 1; away.points += 3; home.losses += 1; }
      else { home.draws += 1; away.draws += 1; home.points += 1; away.points += 1; }
    }
  }
  return Object.values(table).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor || a.club.localeCompare(b.club)).map((row, index) => ({ ...row, position: index + 1, isCurrent: row.club === currentClub }));
}

function readSavedCareer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : null;
  } catch {
    return null;
  }
}

function newCareer(managerName, club) {
  return {
    managerName: managerName.trim(), club, tier: 1, season: 1, matchday: 1, status: "playing",
    confidence: 68, lossesInARow: 0, wins: 0, draws: 0, losses: 0,
    seasonResults: [], trophies: [], championsLeagueUnlocked: false, championsLeagueRound: 0,
    championsLeagueWins: 0, clubs: leagueClubsFor(club),
  };
}

function leagueClubsFor(entryClub) {
  const entryIndex = LOWER_LEAGUE_CLUBS.indexOf(entryClub);
  const rotatedClubs = entryIndex < 0
    ? [...LOWER_LEAGUE_CLUBS]
    : [...LOWER_LEAGUE_CLUBS.slice(entryIndex), ...LOWER_LEAGUE_CLUBS.slice(0, entryIndex)];
  return rotatedClubs.slice(0, 10);
}

function statCard(label, value, detail, Icon) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
      <div className="flex items-center justify-between text-slate-400"><span className="text-[10px] font-bold uppercase tracking-[.16em]">{label}</span><Icon size={16} className="text-lime" /></div>
      <strong className="mt-3 block font-display text-2xl font-bold text-white">{value}</strong>
      <span className="text-xs text-slate-500">{detail}</span>
    </div>
  );
}

function ClubBadge({ name, small = false }) {
  return <span className={`grid shrink-0 place-items-center rounded-xl border border-lime/25 bg-gradient-to-br from-lime/20 to-emerald-900/40 font-display font-black text-lime shadow-lg shadow-lime/5 ${small ? "h-8 w-8 text-[9px]" : "h-12 w-12 text-xs"}`} aria-label={`${name} badge`}>{initials(name)}</span>;
}

function LeagueTable({ standings, currentClub }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-lime">🇬🇧 Tier 1 • League One</p><h2 className="mt-1 font-display text-lg font-bold text-white">League table</h2></div>
        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">10 clubs</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[570px] text-left text-xs">
          <thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">#</th><th className="px-3 py-3">Club</th><th className="px-3 py-3">MP</th><th className="px-3 py-3">W</th><th className="px-3 py-3">D</th><th className="px-3 py-3">L</th><th className="px-4 py-3 text-right">PTS</th></tr></thead>
          <tbody>{standings.map((row) => <tr key={row.club} className={`border-t border-white/5 ${row.club === currentClub ? "bg-lime/[.08] text-white" : "text-slate-300"}`}><td className="px-4 py-3 font-bold text-slate-500">{row.position}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><ClubBadge name={row.club} small /><span className="font-semibold">{row.club}</span>{row.position <= 3 && row.played > 0 && <span className="rounded bg-lime/10 px-1.5 py-0.5 text-[9px] font-bold text-lime">PROMOTION</span>}</div></td><td className="px-3 py-3">{row.played}</td><td className="px-3 py-3">{row.wins}</td><td className="px-3 py-3">{row.draws}</td><td className="px-3 py-3">{row.losses}</td><td className="px-4 py-3 text-right font-black text-lime">{row.points}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function CareerMode({ onBack }) {
  const [profile, setProfile] = useState(readSavedCareer);
  const [managerName, setManagerName] = useState("");
  const [entryClub, setEntryClub] = useState(LOWER_LEAGUE_CLUBS[0]);
  const [answers, setAnswers] = useState([null, null]);
  const [timeLeft, setTimeLeft] = useState(MATCH_TIME_LIMIT);

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(STORAGE_KEY);
  }, [profile]);

  const fixturesByRound = useMemo(() => makeFixtures(profile?.clubs || LOWER_LEAGUE_CLUBS), [profile?.clubs]);
  const standings = useMemo(() => makeStandings(profile?.clubs || LOWER_LEAGUE_CLUBS, profile?.seasonResults || [], profile?.club), [profile?.clubs, profile?.seasonResults, profile?.club]);
  const challenge = useMemo(() => profile ? buildChallenge(profile.season, profile.status === "ucl" ? 20 + profile.championsLeagueRound : profile.matchday) : null, [profile?.season, profile?.matchday, profile?.status, profile?.championsLeagueRound]);

  useEffect(() => {
    if (profile?.status !== "playing" && profile?.status !== "ucl") return undefined;
    setAnswers([null, null]);
    setTimeLeft(MATCH_TIME_LIMIT);
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [profile?.status, profile?.season, profile?.matchday]);

  useEffect(() => {
    if (timeLeft === 0 && profile?.status === "playing") settleMatch();
    else if (timeLeft === 0 && profile?.status === "ucl") settleChampionsLeague();
    // The timeout should submit the selections as they stood when the clock expired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function startCareer(event) {
    event.preventDefault();
    if (!managerName.trim()) return;
    setProfile(newCareer(managerName, entryClub));
  }

  function settleMatch() {
    if (!profile || profile.status !== "playing") return;
    const correct = challenge.questions.filter((question, index) => answers[index] === question.answer).length;
    const points = correct === 2 && timeLeft > 10 ? 3 : correct > 0 ? 1 : 0;
    const win = points === 3;
    const draw = points === 1;
    const nextLossesInARow = points === 0 ? profile.lossesInARow + 1 : 0;
    const confidenceChange = win ? 9 : draw ? 3 : -(12 + Math.min(10, profile.lossesInARow * 3));
    const confidence = clamp(profile.confidence + confidenceChange, 0, 100);
    const userFixture = fixturesByRound[profile.matchday - 1]?.find((fixture) => fixture.home === profile.club || fixture.away === profile.club);
    const round = (fixturesByRound[profile.matchday - 1] || []).map((fixture, index) => {
      const random = seededRandom(profile.season * 12011 + profile.matchday * 113 + index * 17);
      if (fixture.home === profile.club || fixture.away === profile.club) {
        const [homeScore, awayScore] = win ? (fixture.home === profile.club ? [2, 0] : [0, 2]) : draw ? [1, 1] : (fixture.home === profile.club ? [0, 1] : [1, 0]);
        return { ...fixture, homeScore, awayScore };
      }
      const homeScore = Math.floor(random() * 4);
      const awayScore = Math.floor(random() * 4);
      return { ...fixture, homeScore, awayScore };
    });
    const seasonResults = [...profile.seasonResults, round];
    const finalMatchday = profile.matchday >= SEASON_MATCHDAYS;
    const updated = {
      ...profile,
      confidence,
      lossesInARow: nextLossesInARow,
      wins: profile.wins + (win ? 1 : 0),
      draws: profile.draws + (draw ? 1 : 0),
      losses: profile.losses + (points === 0 ? 1 : 0),
      seasonResults,
      lastMatch: { points, correct, timeLeft, opponent: userFixture ? (userFixture.home === profile.club ? userFixture.away : userFixture.home) : "Rivals FC" },
    };
    if (confidence === 0) updated.status = "sacked";
    else if (finalMatchday) {
      const finalStandings = makeStandings(profile.clubs, seasonResults, profile.club);
      const finalClubRow = finalStandings.find((row) => row.club === profile.club);
      const position = finalClubRow?.position || 10;
      updated.seasonSummary = {
        position,
        wins: finalClubRow?.wins || 0,
        draws: finalClubRow?.draws || 0,
        losses: finalClubRow?.losses || 0,
        season: profile.season,
      };
      if (position === 1 && !updated.trophies.includes(TROPHY_NAMES[0])) updated.trophies = [...updated.trophies, TROPHY_NAMES[0]];
      if (position === 1) updated.championsLeagueUnlocked = true;
      updated.status = "season-end";
    } else updated.matchday += 1;
    setProfile(updated);
    setAnswers([null, null]);
  }

  function nextSeason(club = profile.club, tier = profile.tier) {
    setProfile((current) => ({
      ...current,
      club,
      tier,
      season: current.season + 1,
      matchday: 1,
      status: "playing",
      confidence: 68,
      lossesInARow: 0,
      seasonResults: [],
      seasonSummary: null,
      championsLeagueRound: 0,
      championsLeagueWins: 0,
      clubs: [club, ...LOWER_LEAGUE_CLUBS.filter((item) => item !== club)].slice(0, 10),
    }));
  }

  function beginChampionsLeague() {
    setProfile((current) => ({ ...current, status: "ucl", championsLeagueRound: 0, championsLeagueWins: 0 }));
    setAnswers([null, null]);
    setTimeLeft(MATCH_TIME_LIMIT);
  }

  function settleChampionsLeague() {
    if (!challenge || !profile || profile.status !== "ucl") return;
    const correct = challenge.questions.filter((question, index) => answers[index] === question.answer).length;
    const advanced = correct === 2 && timeLeft > 10;
    const round = profile.championsLeagueRound;
    if (!advanced) {
      setProfile((current) => ({ ...current, status: "season-end", championsLeagueUnlocked: false, championsLeagueRound: 0 }));
      return;
    }
    if (round >= UCL_ROUNDS.length - 1) {
      setProfile((current) => ({ ...current, status: "season-end", championsLeagueUnlocked: false, championsLeagueWins: current.championsLeagueWins + 1, trophies: current.trophies.includes(TROPHY_NAMES[1]) ? current.trophies : [...current.trophies, TROPHY_NAMES[1]] }));
      return;
    }
    setProfile((current) => ({ ...current, championsLeagueRound: current.championsLeagueRound + 1, championsLeagueWins: current.championsLeagueWins + 1 }));
    setAnswers([null, null]);
    setTimeLeft(MATCH_TIME_LIMIT);
  }

  function resetCareer() {
    if (window.confirm("Start a new career? Your saved manager profile and trophies will be erased.")) setProfile(null);
  }

  const totalMatches = (profile?.wins || 0) + (profile?.draws || 0) + (profile?.losses || 0);
  const winPercentage = totalMatches ? Math.round((profile.wins / totalMatches) * 100) : 0;
  const roundOpponent = profile && fixturesByRound[profile.matchday - 1]?.find((fixture) => fixture.home === profile.club || fixture.away === profile.club);
  const opponent = roundOpponent ? (roundOpponent.home === profile.club ? roundOpponent.away : roundOpponent.home) : "Rivals FC";

  if (!profile) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/50 p-6 backdrop-blur sm:p-9">
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-lime/10" />
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-lime"><Sparkles size={13} /> Build your legacy</span>
            <h1 className="mt-5 font-display text-4xl font-black uppercase leading-tight text-white sm:text-5xl">Career <span className="text-lime">Mode</span></h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">Take charge of a lower-league club, solve football challenges every matchday, win promotion, and build a trophy cabinet that follows your manager across seasons.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{[["10", "clubs in the league"], ["10", "matchdays per season"], ["3", "challenge rounds to Europe"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-slate-950/40 p-3"><strong className="font-display text-2xl text-lime">{value}</strong><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</p></div>)}</div>
          </section>
          <form onSubmit={startCareer} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur sm:p-8">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-lime/10 text-lime"><UserRound size={20} /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-lime">Manager setup</p><h2 className="font-display text-2xl font-bold text-white">Choose your first job</h2></div></div>
            <label className="mt-6 block text-xs font-semibold text-slate-300" htmlFor="manager-name">Manager name</label>
            <input id="manager-name" value={managerName} onChange={(event) => setManagerName(event.target.value.slice(0, 36))} required maxLength={36} placeholder="e.g. Alex Ferguson" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-lime/50 focus:outline-none focus:ring-2 focus:ring-lime/20" />
            <label className="mt-5 block text-xs font-semibold text-slate-300" htmlFor="entry-club">Tier 1 entry club <span className="ml-1 text-slate-500">• lower leagues</span></label>
            <select id="entry-club" value={entryClub} onChange={(event) => setEntryClub(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-lime/50 focus:outline-none focus:ring-2 focus:ring-lime/20">{LOWER_LEAGUE_CLUBS.map((club) => <option key={club} value={club}>{club}</option>)}</select>
            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-extrabold text-slate-950 transition hover:bg-lime/90">Start your career <ArrowRight size={17} /></button>
            {onBack && <button type="button" onClick={onBack} className="mt-3 w-full rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white">Back to hub</button>}
          </form>
        </div>
      </main>
    );
  }

  const matchInProgress = profile.status === "playing" || profile.status === "ucl";
  const currentChallengeRound = profile.status === "ucl" ? UCL_ROUNDS[profile.championsLeagueRound] : `Matchday ${profile.matchday} of ${SEASON_MATCHDAYS}`;
  const currentChallengeOpponent = profile.status === "ucl" ? "European Knockout Tie" : opponent;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-7 lg:px-9">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-emerald-950/50 p-5 backdrop-blur sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4"><ClubBadge name={profile.club} /><div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-lime">🇬🇧 Tier {profile.tier} • Season {profile.season}</p><span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-400">Manager: {profile.managerName}</span></div><h1 className="mt-1 font-display text-2xl font-black uppercase text-white sm:text-3xl">{profile.club}</h1><p className="mt-1 text-xs text-slate-400">{profile.status === "ucl" ? `Champions League • ${currentChallengeRound}` : `Season ${profile.season} - Matchday ${Math.min(profile.matchday, SEASON_MATCHDAYS)} of ${SEASON_MATCHDAYS}`}</p></div></div>
          <button type="button" onClick={resetCareer} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"><RotateCcw size={14} /> New career</button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">{statCard("Board confidence", `${profile.confidence}%`, profile.lossesInARow ? `${profile.lossesInARow} consecutive loss${profile.lossesInARow > 1 ? "es" : ""}` : "The board is watching", Shield)}{statCard("Career win rate", `${winPercentage}%`, `${profile.wins}W • ${profile.draws}D • ${profile.losses}L`, Medal)}{statCard("Trophy cabinet", profile.trophies.length, profile.trophies.length ? profile.trophies.at(-1) : "Your first silverware awaits", Trophy)}</div>
        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-3"><div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider"><span className="text-slate-400">Board confidence</span><span className={profile.confidence < 30 ? "text-rose-300" : "text-lime"}>{profile.confidence}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full transition-all ${profile.confidence < 30 ? "bg-rose-400" : "bg-gradient-to-r from-emerald-500 to-lime"}`} style={{ width: `${profile.confidence}%` }} /></div></div>
      </section>

      {profile.status === "playing" && challenge && <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-lime">{challenge.mode} • Matchday challenge</p><h2 className="mt-1 font-display text-2xl font-bold text-white">{profile.club} <span className="text-slate-500">vs</span> {opponent}</h2></div><span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold ${timeLeft <= 15 ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : "border-white/10 bg-white/5 text-slate-300"}`}><Clock3 size={14} /> 00:{String(timeLeft).padStart(2, "0")}</span></div>
          <p className="mt-3 text-xs text-slate-500">Get both answers right quickly to earn 3 league points. One correct answer earns a draw point.</p>
          <div className="mt-6 space-y-5">{challenge.questions.map((question, questionIndex) => <div key={`${profile.season}-${profile.matchday}-${questionIndex}`} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><p className="mb-3 text-sm font-semibold leading-relaxed text-white"><span className="mr-2 text-lime">0{questionIndex + 1}</span>{question.prompt}</p><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option) => <button key={option} type="button" onClick={() => setAnswers((current) => current.map((value, index) => index === questionIndex ? option : value))} className={`rounded-lg border px-3 py-2.5 text-left text-xs transition ${answers[questionIndex] === option ? "border-lime/50 bg-lime/10 font-bold text-lime" : "border-white/10 bg-white/[.03] text-slate-300 hover:border-white/20 hover:text-white"}`}>{option}</button>)}</div></div>)}</div>
          <button type="button" disabled={answers.some((answer) => !answer)} onClick={settleMatch} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-extrabold text-slate-950 transition hover:bg-lime/90 disabled:cursor-not-allowed disabled:opacity-40">Submit matchday result <ArrowRight size={16} /></button>
        </div>
        <div className="space-y-5"><LeagueTable standings={standings} currentClub={profile.club} />{profile.lastMatch && <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Previous result</p><p className="mt-2 text-sm font-bold text-white">{profile.lastMatch.points === 3 ? "Victory" : profile.lastMatch.points === 1 ? "Draw" : "Defeat"} <span className="font-normal text-slate-400">vs {profile.lastMatch.opponent}</span></p><p className="mt-1 text-xs text-slate-500">{profile.lastMatch.correct}/2 correct • +{profile.lastMatch.points} league points</p></div>}</div>
      </section>}

      {profile.status === "ucl" && challenge && <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-2xl border border-amber-300/20 bg-slate-900/80 p-5 backdrop-blur sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-amber-300">Champions League • {currentChallengeRound}</p><h2 className="mt-2 font-display text-2xl font-black text-white">European knockout night</h2><p className="mt-2 text-xs text-slate-400">Win both questions before the clock runs down to progress.</p><div className="mt-5 space-y-4">{challenge.questions.map((question, questionIndex) => <div key={questionIndex} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><p className="mb-3 text-sm font-semibold text-white">{question.prompt}</p><div className="grid gap-2 sm:grid-cols-2">{question.options.map((option) => <button key={option} type="button" onClick={() => setAnswers((current) => current.map((value, index) => index === questionIndex ? option : value))} className={`rounded-lg border px-3 py-2.5 text-left text-xs ${answers[questionIndex] === option ? "border-amber-300/50 bg-amber-300/10 text-amber-200" : "border-white/10 bg-white/[.03] text-slate-300"}`}>{option}</button>)}</div></div>)}</div><button type="button" disabled={answers.some((answer) => !answer)} onClick={settleChampionsLeague} className="mt-5 w-full rounded-xl bg-amber-300 px-5 py-3 text-sm font-extrabold text-slate-950 disabled:opacity-40">Play {currentChallengeRound}</button></div><div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-300/10 text-amber-300"><Trophy size={21} /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Continental campaign</p><h3 className="font-display text-xl font-bold text-white">Road to the final</h3></div></div><div className="mt-6 space-y-3">{UCL_ROUNDS.map((round, index) => <div key={round} className={`flex items-center justify-between rounded-xl border p-3 ${index < profile.championsLeagueRound ? "border-emerald-400/20 bg-emerald-400/5" : index === profile.championsLeagueRound ? "border-amber-300/30 bg-amber-300/5" : "border-white/5 bg-slate-950/30"}`}><span className="text-sm font-semibold text-slate-200">{round}</span>{index < profile.championsLeagueRound ? <CheckCircle2 size={16} className="text-emerald-300" /> : <span className="text-[10px] uppercase text-slate-500">{index === profile.championsLeagueRound ? "Up next" : "Locked"}</span>}</div>)}</div></div></section>}

      {profile.status === "season-end" && <section className="grid gap-5 lg:grid-cols-[1fr_.9fr]"><div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-lime">Season {profile.season} • Final whistle</p><h2 className="mt-2 font-display text-3xl font-black text-white">{profile.seasonSummary?.position === 1 ? "Champions!" : profile.seasonSummary?.position <= 3 ? "Promotion secured" : "Season complete"}</h2><p className="mt-2 text-sm text-slate-400">{profile.club} finished {profile.seasonSummary?.position === 1 ? "1st" : `${profile.seasonSummary?.position}${profile.seasonSummary?.position === 2 ? "nd" : profile.seasonSummary?.position === 3 ? "rd" : "th"}`} with {profile.seasonSummary?.wins} wins. Your manager win rate is {winPercentage}%.</p><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-center"><strong className="font-display text-2xl text-lime">{profile.seasonSummary?.wins}</strong><p className="text-[9px] uppercase tracking-wider text-slate-500">Wins</p></div><div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-center"><strong className="font-display text-2xl text-white">{profile.seasonSummary?.draws}</strong><p className="text-[9px] uppercase tracking-wider text-slate-500">Draws</p></div><div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-center"><strong className="font-display text-2xl text-rose-300">{profile.seasonSummary?.losses}</strong><p className="text-[9px] uppercase tracking-wider text-slate-500">Losses</p></div></div>
          {profile.seasonSummary?.position <= 3 && <div className="mt-6"><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-lime">Promotion offers • choose your next club</p><div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{PROMOTION_OFFERS.slice(0, profile.seasonSummary.position === 1 ? 10 : 8).map((club) => <button key={club} type="button" onClick={() => nextSeason(club, profile.tier + (profile.seasonSummary.position === 1 ? 2 : 1))} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-left transition hover:border-lime/40"><ClubBadge name={club} small /><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">{club}</strong><span className="text-[10px] text-slate-500">Tier {profile.tier + (profile.seasonSummary.position === 1 ? 2 : 1)} contract</span></span><ArrowRight size={14} className="text-lime" /></button>)}</div></div>}
          {profile.seasonSummary?.position > 3 && <button type="button" onClick={() => nextSeason()} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-extrabold text-slate-950">Stay at {profile.club} for next season <ArrowRight size={16} /></button>}
          {profile.championsLeagueUnlocked && <div className="mt-6 rounded-xl border border-amber-300/25 bg-amber-300/[.06] p-4"><div className="flex items-center gap-3"><Crown size={20} className="text-amber-300" /><div><p className="font-bold text-white">Champions League unlocked</p><p className="mt-1 text-xs text-slate-400">Take your league-winning club into Europe’s knockout tournament.</p></div></div><button type="button" onClick={beginChampionsLeague} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-slate-950">Enter Champions League <Trophy size={14} /></button></div>}
        </div><LeagueTable standings={standings} currentClub={profile.club} /></section>}

      {profile.status === "sacked" && <section className="mx-auto max-w-3xl rounded-3xl border border-rose-400/20 bg-slate-900/85 p-6 text-center backdrop-blur sm:p-9"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-400/10 text-rose-300"><Shield size={26} /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-rose-300">Board decision</p><h2 className="mt-2 font-display text-4xl font-black text-white">You’ve been sacked</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">The board at {profile.club} ran out of patience. Your manager record and trophy cabinet are safe. A few lower-tier clubs are ready to give you another chance.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{LOWER_LEAGUE_CLUBS.filter((club) => club !== profile.club).slice(0, 3).map((club) => <button key={club} type="button" onClick={() => nextSeason(club, 1)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-left hover:border-lime/30"><ClubBadge name={club} small /><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">{club}</strong><span className="text-[10px] text-slate-500">New job offer • Tier 1</span></span><ArrowRight size={14} className="text-lime" /></button>)}</div></section>}

      <section className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
        {profile.status === "season-end" || profile.status === "sacked" ? <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-300/10 text-amber-300"><Trophy size={19} /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Manager profile</p><h3 className="font-display text-lg font-bold text-white">{profile.managerName}</h3></div></div><p className="mt-3 text-xs text-slate-400">Current club: <strong className="text-white">{profile.club}</strong> • Career win rate: <strong className="text-lime">{winPercentage}%</strong></p></div> : <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center gap-3"><CalendarDays size={18} className="text-lime" /><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Season rhythm</p><h3 className="font-display text-lg font-bold text-white">One challenge, one result</h3></div></div><p className="mt-3 text-xs leading-relaxed text-slate-400">Solve the football puzzle before time runs out. Results update the full 10-club standings and the board’s confidence in your project.</p></div>}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Trophy cabinet</p><h3 className="mt-1 font-display text-lg font-bold text-white">Career honours</h3></div><span className="rounded-lg bg-lime/10 px-2.5 py-1 text-xs font-bold text-lime">{profile.trophies.length} trophies</span></div>{profile.trophies.length ? <div className="mt-3 flex flex-wrap gap-2">{profile.trophies.map((trophy) => <span key={trophy} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/20 bg-amber-300/[.06] px-2.5 py-1.5 text-[10px] font-semibold text-amber-200"><Trophy size={12} />{trophy}</span>)}</div> : <p className="mt-3 text-xs text-slate-500">Win the league or conquer Europe to earn your first trophy.</p>}</div>
      </section>
    </main>
  );
}
