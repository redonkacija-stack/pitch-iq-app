import { matches as originalMatches } from "./matchData.js";
import { careers as originalCareers } from "./transferData.js";
import { profiles as originalProfiles } from "./tacticsData.js";
import { DATA_SEASON, DATA_AS_OF, stampDataset } from "./seasonConfig";

export { DATA_SEASON, DATA_AS_OF };

const rawMatches = [
  ...originalMatches,
  {
    id: "real-madrid-liverpool-2018",
    title: "UEFA Champions League Final",
    subtitle: "Real Madrid vs Liverpool · 26 May 2018 · Kyiv",
    formation: "4-3-1-2",
    team: "Real Madrid",
    opponent: "Liverpool",
    players: [
      {
        id: "navas-2018",
        name: "Keylor Navas",
        number: 1,
        flag: "🇨🇷",
        position: "GK",
        x: 50,
        y: 90,
        clubHint: "Levante",
      },
      {
        id: "carvajal-2018",
        name: "Dani Carvajal",
        number: 2,
        flag: "🇪🇸",
        position: "RB",
        x: 84,
        y: 73,
        clubHint: "Bayer Leverkusen",
      },
      {
        id: "varane-2018",
        name: "Raphaël Varane",
        number: 5,
        flag: "🇫🇷",
        position: "CB",
        x: 62,
        y: 76,
        clubHint: "Lens",
      },
      {
        id: "ramos-2018",
        name: "Sergio Ramos",
        number: 4,
        flag: "🇪🇸",
        position: "CB",
        x: 38,
        y: 76,
        clubHint: "Sevilla",
      },
      {
        id: "marcelo-2018",
        name: "Marcelo",
        number: 12,
        flag: "🇧🇷",
        position: "LB",
        x: 16,
        y: 73,
        clubHint: "Fluminense",
      },
      {
        id: "casemiro-2018",
        name: "Casemiro",
        number: 14,
        flag: "🇧🇷",
        position: "DM",
        x: 50,
        y: 59,
        clubHint: "Porto",
      },
      {
        id: "kroos-2018",
        name: "Toni Kroos",
        number: 8,
        flag: "🇩🇪",
        position: "CM",
        x: 69,
        y: 51,
        clubHint: "Bayern Munich",
      },
      {
        id: "modric-2018",
        name: "Luka Modrić",
        number: 10,
        flag: "🇭🇷",
        position: "CM",
        x: 31,
        y: 51,
        clubHint: "Tottenham Hotspur",
      },
      {
        id: "isco-2018",
        name: "Isco",
        number: 22,
        flag: "🇪🇸",
        position: "AM",
        x: 50,
        y: 38,
        clubHint: "Málaga",
      },
      {
        id: "ronaldo-2018",
        name: "Cristiano Ronaldo",
        number: 7,
        flag: "🇵🇹",
        position: "ST",
        x: 64,
        y: 22,
        clubHint: "Manchester United",
      },
      {
        id: "benzema-2018",
        name: "Karim Benzema",
        number: 9,
        flag: "🇫🇷",
        position: "ST",
        x: 36,
        y: 22,
        clubHint: "Lyon",
      },
    ],
    result:
      "Real Madrid won 3–1 to claim a third consecutive Champions League title. Gareth Bale scored twice after coming on as a substitute.",
  },
];

const rawCareers = [
  ...originalCareers,
  {
    id: "cristiano-ronaldo-career",
    answer: "Cristiano Ronaldo",
    aliases: ["ronaldo", "cr7", "cristiano"],
    nationality: "🇵🇹",
    clubs: [
      { name: "Sporting CP", years: "2002–2003", country: "Portugal" },
      { name: "Manchester United", years: "2003–2009", country: "England" },
      { name: "Real Madrid", years: "2009–2018", country: "Spain" },
      { name: "Juventus", years: "2018–2021", country: "Italy" },
      { name: "Manchester United", years: "2021–2022", country: "England" },
      { name: "Al Nassr", years: "2023–present", country: "Saudi Arabia" },
    ],
    hints: [
      "Won five UEFA Champions League titles.",
      "Became Real Madrid’s all-time leading scorer.",
      "Captained Portugal to the UEFA Euro 2016 title.",
    ],
    fact: "Ronaldo has won league titles in England, Spain and Italy and became the first men’s player to score at five FIFA World Cups.",
  },
  {
    id: "luka-modric-career",
    answer: "Luka Modrić",
    aliases: ["modric", "luka"],
    nationality: "🇭🇷",
    clubs: [
      { name: "Dinamo Zagreb", years: "2003–2008", country: "Croatia" },
      { name: "Tottenham Hotspur", years: "2008–2012", country: "England" },
      { name: "Real Madrid", years: "2012–2025", country: "Spain" },
      { name: "AC Milan", years: "2025–present", country: "Italy" },
    ],
    hints: [
      "Won the 2018 Ballon d’Or.",
      "Captained Croatia to the 2018 World Cup final.",
      "Won six UEFA Champions League titles with Real Madrid.",
    ],
    fact: "Modrić became Croatia’s most-capped player and won the 2018 Ballon d’Or after leading his country to the World Cup final.",
  },
  {
    id: "neymar-career",
    answer: "Neymar",
    aliases: ["neymar jr", "neymar junior"],
    nationality: "🇧🇷",
    clubs: [
      { name: "Santos", years: "2009–2013", country: "Brazil" },
      { name: "Barcelona", years: "2013–2017", country: "Spain" },
      { name: "Paris Saint-Germain", years: "2017–2023", country: "France" },
      { name: "Al-Hilal", years: "2023–2025", country: "Saudi Arabia" },
      { name: "Santos", years: "2025–present", country: "Brazil" },
    ],
    hints: [
      "Won the 2015 UEFA Champions League with Barcelona.",
      "Scored the winning goal in the 2016 Olympic final.",
      "Returned to his boyhood club in 2025.",
    ],
    fact: "Neymar won the UEFA Champions League with Barcelona and Olympic gold with Brazil before returning to Santos in 2025.",
  },
];

const rawProfiles = [
  ...originalProfiles,
  {
    id: "ancelotti-fluid-real",
    question: "Which manager’s team is this?",
    principles: [
      "The midfield adapts its shape to protect the ball and release runners.",
      "Wide forwards can drift inside while full-backs provide width.",
      "The team changes tempo rather than pressing at maximum intensity every phase.",
      "Experienced players receive freedom to solve problems in possession.",
    ],
    options: [
      "Carlo Ancelotti",
      "Thomas Tuchel",
      "Diego Simeone",
      "Roberto De Zerbi",
    ],
    answer: "Carlo Ancelotti",
    explanation:
      "Ancelotti is known for pragmatic tactical flexibility and trusting experienced players to interpret roles. His teams have used several shapes rather than relying on one rigid system.",
  },
  {
    id: "arteta-arsenal",
    question: "Which manager’s team is this?",
    principles: [
      "A structured build-up creates numerical advantages near the ball.",
      "Full-backs may invert to support central possession.",
      "The team presses high with coordinated triggers and a compact rest defence.",
      "Attacking rotations create space for a winger to isolate a defender.",
    ],
    options: ["Mikel Arteta", "Jürgen Klopp", "Unai Emery", "Carlo Ancelotti"],
    answer: "Mikel Arteta",
    explanation:
      "Arteta’s Arsenal combines positional structure, aggressive pressing and carefully managed rest defence. The specific shape varies by opponent and player availability.",
  },
];

const nationalityCodeByEmoji = {
  "🇦🇷": "ar",
  "🇧🇷": "br",
  "🇨🇷": "cr",
  "🇭🇷": "hr",
  "🇩🇪": "de",
  "🇪🇸": "es",
  "🇫🇷": "fr",
  "🇵🇹": "pt",
  "🇸🇪": "se",
  "🇺🇾": "uy",
};

const countryCodeByName = {
  Brazil: "br",
  Croatia: "hr",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Italy: "it",
  Netherlands: "nl",
  Portugal: "pt",
  "Saudi Arabia": "sa",
  Spain: "es",
  Sweden: "se",
  "United States": "us",
};

const managerNationalityCodes = {
  "Carlo Ancelotti": "it",
  "Diego Simeone": "ar",
  "Jürgen Klopp": "de",
  "José Mourinho": "pt",
  "Mikel Arteta": "es",
  "Pep Guardiola": "es",
  "Roberto De Zerbi": "it",
  "Thomas Tuchel": "de",
  "Unai Emery": "es",
};

const clubCrestFiles = {
  "AC Milan": "AC Milan logo.svg",
  "Al-Hilal": "Al-Hilal SFC Logo.svg",
  "Al Nassr": "Al-Nassr FC Logo.svg",
  Ajax: "AFC Ajax logo.svg",
  Arsenal: "Arsenal FC.svg",
  "Arsenal (loan)": "Arsenal FC.svg",
  Barcelona: "FC Barcelona (crest).svg",
  "Barcelona academy": "FC Barcelona (crest).svg",
  "Bayer Leverkusen": "Bayer 04 Leverkusen logo.svg",
  "Bayern Munich": "FC Bayern München logo (2017).svg",
  "Borussia Mönchengladbach": "Borussia Mönchengladbach logo.svg",
  "Dinamo Zagreb": "GNK Dinamo Zagreb logo.svg",
  "Inter Milan": "Inter Milan.svg",
  Juventus: "Juventus FC 2017 logo.svg",
  "LA Galaxy": "LA Galaxy logo.svg",
  Lens: "RC Lens logo.svg",
  Liverpool: "Liverpool FC.svg",
  "Manchester City": "Manchester City FC badge.svg",
  "Manchester United": "Manchester United FC crest.svg",
  Málaga: "Málaga CF logo.svg",
  "Malmö FF": "Malmö FF logo.svg",
  Monaco: "AS Monaco FC.svg",
  "New York Red Bulls": "New York Red Bulls logo.svg",
  "Newell’s Old Boys": "Newell's Old Boys logo.svg",
  "Paris Saint-Germain": "Paris Saint-Germain F.C..svg",
  Porto: "FC Porto.svg",
  Real: "Real Madrid CF.svg",
  "Real Madrid": "Real Madrid CF.svg",
  Santos: "Santos FC logo.svg",
  Sevilla: "Sevilla FC crest.svg",
  Spain: "Spain national football team crest.svg",
  "Sporting CP": "Sporting Clube de Portugal (Logo).svg",
  Tottenham: "Tottenham Hotspur.svg",
  "Tottenham Hotspur": "Tottenham Hotspur.svg",
  Valencia: "Valencia CF logo.svg",
  Villarreal: "Villarreal CF logo.svg",
  Netherlands: "Netherlands national football team.svg",
};

function clubLogoUrl(name) {
  const file = clubCrestFiles[name];
  return file
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=128`
    : null;
}

const tacticalTeamByManager = {
  "Carlo Ancelotti": "Real Madrid",
  "Diego Simeone": "Atlético Madrid",
  "Jürgen Klopp": "Liverpool",
  "Mikel Arteta": "Arsenal",
  "Pep Guardiola": "Manchester City",
};
clubCrestFiles["Atlético Madrid"] = "Atletico Madrid 2017 logo.svg";

function deduplicate(list) {
  const map = new Map();
  for (const item of list) {
    if (item?.id) map.set(item.id, { ...map.get(item.id), ...item });
  }
  return Array.from(map.values());
}

export const matches = stampDataset(deduplicate(rawMatches).map((match) => ({
  ...match,
  teamLogoUrl: match.teamLogoUrl || clubLogoUrl(match.team),
  opponentLogoUrl: match.opponentLogoUrl || clubLogoUrl(match.opponent),
  players: match.players.map((player) => ({
    ...player,
    nationalityCode:
      player.nationalityCode || nationalityCodeByEmoji[player.flag] || null,
    clubLogoUrl: player.clubLogoUrl || clubLogoUrl(match.team),
  })),
})));

const careerSeasonSnapshot = {
  "cristiano-ronaldo-career": {
    club: "Al Nassr",
    source: "https://www.spl.com.sa/en/players/cristiano-ronaldo/index",
    clubs: [{ name: "Al Nassr", years: "2023–2026/27", country: "Saudi Arabia" }],
  },
  "luka-modric-career": {
    club: "AC Milan",
    contractThrough: "2027-06-30",
    source: "https://www.acmilan.com/en/news/articles/media/2026-07-23/official-statement-luka-modric",
    clubs: [
      { name: "Real Madrid", years: "2012–2025", country: "Spain" },
      { name: "AC Milan", years: "2025–2027", country: "Italy" },
    ],
  },
  "neymar-career": {
    club: "Santos",
    contractThrough: "2026-12-31",
    source: "https://www.santosfc.com.br/santos-fc-e-neymar-jr-renovam-contrato-ate-o-fim-de-2026/",
    clubs: [{ name: "Santos", years: "2025–2026", country: "Brazil" }],
  },
  "kevin-de-bruyne-career": {
    club: "Napoli",
    source: "https://www.uefa.com/uefachampionsleague/clubs/50136--napoli/squad/",
    clubs: [{ name: "Manchester City", years: "2015–2025", country: "England" }, { name: "Napoli", years: "2025–2026/27", country: "Italy" }],
  },
  "angel-di-maria-career": {
    club: "Rosario Central",
    source: "https://www.rosariocentral.com/",
    clubs: [{ name: "Benfica", years: "2023–2025", country: "Portugal" }, { name: "Rosario Central", years: "2025–2026", country: "Argentina" }],
  },
  "robert-lewandowski-career": {
    club: null,
    source: "https://www.fcbarcelona.com/en/football/first-team/players",
    clubs: [{ name: "Barcelona", years: "2022–2026", country: "Spain" }],
  },
  "erling-haaland-career": {
    club: "Manchester City",
    source: "https://www.mancity.com/players/mens/erling-haaland",
    clubs: [{ name: "Manchester City", years: "2022–2026/27", country: "England" }],
  },
  "jude-bellingham-career": {
    club: "Real Madrid",
    source: "https://www.realmadrid.com/en-US/football/first-team/players/jude-bellingham",
    clubs: [{ name: "Real Madrid", years: "2023–2026/27", country: "Spain" }],
  },
};

export const careers = stampDataset(deduplicate(rawCareers).map((career) => ({
  ...career,
  ...(careerSeasonSnapshot[career.id] ? {
    currentClub: careerSeasonSnapshot[career.id].club,
    contractThrough: careerSeasonSnapshot[career.id].contractThrough,
    currentClubSource: careerSeasonSnapshot[career.id].source,
  } : {}),
  nationalityCode:
    career.nationalityCode ||
    nationalityCodeByEmoji[career.nationality] ||
    null,
  clubs: (careerSeasonSnapshot[career.id]?.clubs || career.clubs).map((club) => ({
    ...club,
    countryCode: club.countryCode || countryCodeByName[club.country] || null,
    logoUrl: club.logoUrl || clubLogoUrl(club.name),
  })),
})));

export const profiles = stampDataset(deduplicate(rawProfiles).map((profile) => ({
  ...profile,
  team: profile.team || tacticalTeamByManager[profile.answer] || null,
  teamLogoUrl:
    profile.teamLogoUrl ||
    clubLogoUrl(tacticalTeamByManager[profile.answer] || ""),
  managerNationalityCode:
    profile.managerNationalityCode ||
    managerNationalityCodes[profile.answer] ||
    null,
  optionNationalityCodes: profile.options.map(
    (manager) => managerNationalityCodes[manager] || null,
  ),
})));
