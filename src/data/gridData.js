import footballGridJson from "./footballGrid.json";
import { DATA_AS_OF, DATA_SEASON, stampDataset } from "./seasonConfig";
import { leagueTeams } from "./leagueTeams";

const criterion = (type, value, label = value) => ({ type, value, label });
const club = (value) => criterion("club", value, `Played for ${value}`);
const country = (value) => criterion("country", value, value);
const trophy = (value, label = value) => criterion("trophy", value, label);
const manager = (value, label = `Played under ${value}`) => criterion("manager", value, label);

const managerRecords = [
  { match: "Thierry Henry", managers: ["Arsène Wenger", "Pep Guardiola"] },
  { match: "Kak", managers: ["Carlo Ancelotti"] },
  { match: "N'Golo Kanté", managers: ["Claudio Ranieri", "Antonio Conte", "Thomas Tuchel"] },
  { match: "Wayne Rooney", managers: ["Sir Alex Ferguson", "José Mourinho"] },
  { match: "Jude Bellingham", managers: ["Carlo Ancelotti"] },
  { match: "Harry Kane", managers: ["Thomas Tuchel"] },
  { match: "Karim Benzema", managers: ["Carlo Ancelotti", "José Mourinho", "Zinedine Zidane"] },
  { match: "Paul Pogba", managers: ["José Mourinho", "Massimiliano Allegri"] },
  { match: "Casemiro", managers: ["Carlo Ancelotti", "Zinedine Zidane"] },
  { match: "David Beckham", managers: ["Sir Alex Ferguson", "Carlo Ancelotti"] },
  { match: "Xabi Alonso", managers: ["Pep Guardiola", "Carlo Ancelotti", "José Mourinho"] },
  { match: "Toni Kroos", managers: ["Pep Guardiola", "Carlo Ancelotti"] },
  { match: "Sergio Ramos", managers: ["Carlo Ancelotti", "José Mourinho", "Zinedine Zidane"] },
  { match: "Cristiano Ronaldo", managers: ["Carlo Ancelotti", "José Mourinho", "Zinedine Zidane", "Sir Alex Ferguson"] },
  { match: "Lionel Messi", managers: ["Pep Guardiola", "Luis Enrique", "Frank Rijkaard"] },
  { match: "Angel Di Maria", managers: ["Carlo Ancelotti", "José Mourinho"] },
  { match: "Erling Haaland", managers: ["Pep Guardiola"] },
  { match: "Manuel Neuer", managers: ["Pep Guardiola", "Hansi Flick"] },
  { match: "Leroy San", managers: ["Pep Guardiola", "Hansi Flick"] },
  { match: "Kylian Mbapp", managers: ["Carlo Ancelotti", "Luis Enrique"] },
  { match: "Johan Cruyff", managers: ["Rinus Michels"] },
  { match: "Ronaldinho", managers: ["Frank Rijkaard", "Carlo Ancelotti"] },
  { match: "Robert Lewandowski", managers: ["Hansi Flick", "Pep Guardiola"] },
  { match: "Raphinha", managers: ["Hansi Flick", "Xavi"] },
  { match: "Thomas Müller", managers: ["Hansi Flick", "Pep Guardiola"] },
  { match: "Arjen Robben", managers: ["Pep Guardiola", "José Mourinho", "Carlo Ancelotti"] },
];

const honorRecords = [
  { match: "Lionel Messi", honors: ["FIFA World Cup Winner", "Ballon d'Or Winner"] },
  { match: "Cristiano Ronaldo", honors: ["Ballon d'Or Winner"] },
  { match: "Kak", honors: ["Ballon d'Or Winner"] },
  { match: "Ronaldo Naz", honors: ["FIFA World Cup Winner", "Ballon d'Or Winner"] },
  { match: "Paul Pogba", honors: ["FIFA World Cup Winner"] },
  { match: "Angel Di Maria", honors: ["FIFA World Cup Winner"] },
  { match: "Johan Cruyff", honors: ["Ballon d'Or Winner"] },
  { match: "Ronaldinho", honors: ["Ballon d'Or Winner"] },
  { match: "Diego Maradona", honors: ["FIFA World Cup Winner"] },
  { match: "Pel", honors: ["FIFA World Cup Winner"] },
  { match: "Romario", honors: ["FIFA World Cup Winner"] },
  { match: "Zinedine Zidane", honors: ["FIFA World Cup Winner", "Ballon d'Or Winner"] },
];

const additionalPlayers = [
  { name: "Johan Cruyff", clubs: ["Ajax", "Barcelona"], countries: ["Netherlands"], trophies: ["Champions League Winner", "La Liga"], managers: ["Rinus Michels"], honors: ["Ballon d'Or Winner"] },
  { name: "Ronaldinho", clubs: ["Paris Saint-Germain", "Barcelona", "AC Milan", "Flamengo"], countries: ["Brazil"], trophies: ["Champions League Winner", "La Liga"], managers: ["Frank Rijkaard", "Carlo Ancelotti"], honors: ["Ballon d'Or Winner"] },
  { name: "Diego Maradona", clubs: ["Boca Juniors", "Barcelona", "Napoli"], countries: ["Argentina"], trophies: ["La Liga"], managers: ["César Luis Menotti", "Carlos Bilardo"], honors: ["FIFA World Cup Winner"] },
  { name: "Pelé", clubs: ["Santos FC", "New York Cosmos"], countries: ["Brazil"], trophies: [], managers: [], honors: ["FIFA World Cup Winner"] },
  { name: "Romário", clubs: ["Barcelona", "PSV Eindhoven", "Flamengo"], countries: ["Brazil"], trophies: ["La Liga"], managers: ["Johan Cruyff"], honors: ["FIFA World Cup Winner"] },
  { name: "Robert Lewandowski", clubs: ["Borussia Dortmund", "Bayern Munich", "Barcelona"], countries: ["Poland"], trophies: ["Champions League Winner", "La Liga"], managers: ["Hansi Flick", "Pep Guardiola"] },
  { name: "Raphinha", clubs: ["Barcelona", "Leeds United", "Sporting CP"], countries: ["Brazil"], trophies: ["La Liga"], managers: ["Hansi Flick", "Xavi"], currentClub: "FC Barcelona", currentClubSeason: "2026/27" },
  { name: "Zinedine Zidane", clubs: ["Real Madrid", "Juventus"], countries: ["France"], trophies: ["Champions League Winner", "Serie A"], managers: ["Marcello Lippi", "Carlo Ancelotti"], honors: ["FIFA World Cup Winner", "Ballon d'Or Winner"] },
  { name: "Ronald Koeman", clubs: ["Barcelona", "Ajax", "PSV Eindhoven"], countries: ["Netherlands"], trophies: ["Champions League Winner", "La Liga"], managers: ["Johan Cruyff"] },
  { name: "Virgil van Dijk", clubs: ["Liverpool", "Celtic", "Southampton"], countries: ["Netherlands"], trophies: ["Champions League Winner", "Premier League"], managers: ["Jürgen Klopp"] },
  { name: "Neymar", clubs: ["Santos FC", "Barcelona", "Paris Saint-Germain", "Al-Hilal"], countries: ["Brazil"], trophies: ["Champions League Winner", "La Liga"], managers: ["Luis Enrique"], currentClub: "Santos FC", currentClubSeason: "2026" },
  { name: "Alfredo Di Stéfano", clubs: ["River Plate", "Real Madrid"], countries: ["Argentina", "Spain"], trophies: ["Champions League Winner", "La Liga"], honors: ["Ballon d'Or Winner"] },
  { name: "Enzo Fernández", clubs: ["River Plate", "Benfica", "Chelsea"], countries: ["Argentina"], trophies: ["FIFA World Cup Winner"], managers: [] },
  { name: "Dani Alves", clubs: ["Barcelona", "Juventus", "Paris Saint-Germain"], countries: ["Brazil"], trophies: ["Champions League Winner", "La Liga"], managers: ["Pep Guardiola", "Luis Enrique"] },
  { name: "Mohamed Salah", clubs: ["Liverpool", "Chelsea", "Roma", "Basel"], countries: ["Egypt"], trophies: ["Champions League Winner", "Premier League"], managers: ["Jürgen Klopp"] },
  { name: "Sadio Mané", clubs: ["Liverpool", "Bayern Munich", "Southampton", "Salzburg"], countries: ["Senegal"], trophies: ["Champions League Winner", "Premier League", "Bundesliga"], managers: ["Jürgen Klopp"] },
  { name: "Yaya Touré", clubs: ["Barcelona", "Manchester City", "Monaco"], countries: ["Ivory Coast"], trophies: ["Champions League Winner", "La Liga", "Premier League"], managers: ["Pep Guardiola"] },
  { name: "Samuel Eto'o", clubs: ["Barcelona", "Inter Milan", "Real Madrid", "Chelsea", "Mallorca"], countries: ["Cameroon"], trophies: ["Champions League Winner", "La Liga", "Serie A"], managers: ["José Mourinho"] },
  { name: "Kevin De Bruyne", clubs: ["Manchester City", "Chelsea", "Wolfsburg", "Napoli"], countries: ["Belgium"], trophies: ["Champions League Winner", "Premier League"], managers: ["Pep Guardiola"] },
  { name: "Luka Modrić", clubs: ["Real Madrid", "AC Milan", "Tottenham", "Dinamo Zagreb"], countries: ["Croatia"], trophies: ["Champions League Winner", "La Liga"], honors: ["Ballon d'Or Winner"], managers: ["Carlo Ancelotti"] },
  { name: "Luis Suárez", clubs: ["Ajax", "Liverpool", "Barcelona", "Atletico Madrid"], countries: ["Uruguay"], trophies: ["Champions League Winner", "La Liga", "Eredivisie"], managers: ["Luis Enrique"] },
];

function findRecords(records, name) {
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return records.find(({ match }) => {
    const normalizedMatch = match.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return normalizedName.includes(normalizedMatch);
  });
}

const basePlayers = footballGridJson.players.map((player) => ({
  ...player,
  clubs: player.name.includes("Ronaldo Naz") && !player.clubs.includes("Corinthians") ? [...player.clubs, "Corinthians"] : player.clubs,
  managers: player.managers || findRecords(managerRecords, player.name)?.managers || [],
  honors: [...new Set([...(player.honors || []), ...(findRecords(honorRecords, player.name)?.honors || [])])],
}));

const existingNames = new Set(basePlayers.map((player) => player.name.toLowerCase()));
export const gridPlayers = stampDataset([
  ...basePlayers,
  ...additionalPlayers.filter((player) => !existingNames.has(player.name.toLowerCase())),
]);

// Build nationality challenges from the full player dataset, rather than a
// hand-picked list of the most common footballing countries.
export const gridCountries = [...new Set(
  gridPlayers.flatMap((player) => player.countries || []).filter(Boolean),
)].sort((a, b) => a.localeCompare(b));

// Matrix rows use competitions and honors, so the left axis asks players to
// match a league/cup achievement against the country or challenge at the top.
export const gridCompetitionRows = [...new Set(
  gridPlayers.flatMap((player) => [...(player.trophies || []), ...(player.honors || [])]).filter(Boolean),
)].sort((a, b) => a.localeCompare(b)).map((value) => {
  const labels = {
    "Champions League Winner": "Won Champions League",
    "FIFA World Cup Winner": "Won World Cup",
    "Ballon d'Or Winner": "Ballon d'Or Winner",
  };
  return trophy(value, labels[value] || `Won ${value}`);
});

const seededRandom = (seed, salt = "") => {
  let state = (Math.floor(seed * 0xffffffff) ^ [...salt].reduce((sum, char) => sum + char.charCodeAt(0), 0)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

export function pickLeagueColumns(league, seed = Math.random()) {
  if (!league) return [];
  const random = seededRandom(seed, `${league.id}-countries`);
  const countries = [...gridCountries];
  for (let index = countries.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [countries[index], countries[swap]] = [countries[swap], countries[index]];
  }
  const countryColumns = countries.slice(0, 2).map((name) => country(name));
  const otherColumns = (league.columns || []).filter((item) => item.type !== "country");
  const otherColumn = otherColumns.length
    ? otherColumns[Math.floor(random() * otherColumns.length)]
    : trophy("Champions League Winner", "Won Champions League");
  return [...countryColumns, otherColumn];
}

export const leagueRows = (teams) => teams.map((team) => club(team));

export function pickLeagueRows(league, seed = Math.random()) {
  const pool = gridCompetitionRows;
  let state = (Math.floor(seed * 0xffffffff) ^ league.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled.slice(0, 3);
}

export function gridCriteriaForCell(league, index) {
  if (!league || index < 0 || index > 8) return null;
  return {
    row: league.rows[Math.floor(index / 3)],
    column: league.columns[index % 3],
  };
}

export function playerMatchesGridCriterion(player, criterion) {
  if (!player || !criterion) return false;
  const values = criterion.type === "club" ? player.clubs || []
    : criterion.type === "country" ? player.countries || []
      : criterion.type === "manager" ? player.managers || []
        : criterion.type === "trophy" ? [...(player.trophies || []), ...(player.honors || [])]
          : criterion.type === "league" ? player.leagues || [] : [];
  const normalizeValue = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const clubAliases = {
    "athletic club": ["athletic bilbao"],
    "atletico de madrid": ["atletico madrid"],
    "fc barcelona": ["barcelona"],
    "bayern munchen": ["bayern munich", "fc bayern munchen"],
    "inter": ["inter milan"],
    "man city": ["manchester city"],
    "man united": ["manchester united"],
    "paris": ["paris saint germain", "psg"],
    "psv": ["psv eindhoven"],
    "rb leipzig": ["leipzig"],
    "real betis": ["betis"],
    "roma": ["as roma"],
    "stuttgart": ["vfb stuttgart"],
    "tottenham hotspur": ["tottenham"],
  };
  const criterionName = normalizeValue(criterion.value);
  const aliasValues = Object.entries(clubAliases).find(([name]) => normalizeValue(name) === criterionName)?.[1] || [];
  const aliases = new Set([criterionName, ...aliasValues.map(normalizeValue)]);
  return values.some((value) => aliases.has(normalizeValue(value)) || (criterion.type !== "club" && normalizeValue(value) === criterionName));
}

export function playerMatchesGridCell(player, league, index) {
  const criteria = gridCriteriaForCell(league, index);
  return Boolean(criteria && playerMatchesGridCriterion(player, criteria.row) && playerMatchesGridCriterion(player, criteria.column));
}

export const leagueOptions = [
  {
    id: "global", name: "Global", emblem: "WORLD", flag: null,
    description: "World football, continental champions and international icons.",
    competition: "Global / UEFA Champions League", season: DATA_SEASON,
    teams: leagueTeams.global,
    sourceUrl: "https://www.uefa.com/uefachampionsleague/news/02a8-2171a88881a0-c70193b972c6-1000--meet-the-2026-27-champions-league-league-phase-teams/",
    rows: [manager("Pep Guardiola"), manager("Carlo Ancelotti", "Coached by Carlo Ancelotti"), manager("Hansi Flick", "Managed by Hansi Flick")],
    columns: [country("Argentina"), country("Brazil"), country("Germany")],
  },
  {
    id: "england", name: "England", emblem: "PL", flag: "gb-eng",
    description: "Premier League clubs, international stars and major honors.",
    competition: "Premier League", season: DATA_SEASON,
    teams: leagueTeams.england,
    sourceUrl: "https://www.premierleague.com/en/news/4673099/the-202627-premier-league-season-officially-starts",
    rows: leagueRows(leagueTeams.england),
    columns: [country("France"), country("Brazil"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "spain", name: "Spain", emblem: "LL", flag: "es",
    description: "La Liga giants, nationalities and European honors.",
    competition: "LALIGA EA SPORTS", season: DATA_SEASON,
    teams: leagueTeams.spain,
    sourceUrl: "https://www.laliga.com/en-US/laliga-easports/clubs",
    rows: leagueRows(leagueTeams.spain),
    columns: [country("France"), country("Brazil"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "italy", name: "Italy", emblem: "SA", flag: "it",
    description: "Serie A clubs, nationalities and trophy-winning players.",
    competition: "Serie A", season: DATA_SEASON,
    teams: leagueTeams.italy,
    sourceUrl: "https://en.legaseriea.it/serie-a/news/looking-forward-to-the-2026-27-serie-a-fixture-list",
    rows: leagueRows(leagueTeams.italy),
    columns: [country("Argentina"), country("France"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "germany", name: "Germany", emblem: "BL", flag: "de",
    description: "All Bundesliga clubs, German internationals and European winners.",
    competition: "Bundesliga", season: DATA_SEASON,
    teams: leagueTeams.germany,
    sourceUrl: "https://www.bundesliga.com/de/bundesliga/clubs",
    rows: leagueRows(leagueTeams.germany),
    columns: [country("Germany"), country("France"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "france", name: "France", emblem: "L1", flag: "fr",
    description: "Ligue 1 clubs, world champions and global football stars.",
    competition: "Ligue 1 McDonald's", season: DATA_SEASON,
    teams: leagueTeams.france,
    sourceUrl: "https://ligue1.com/fr/articles/l1_article_5284-",
    rows: leagueRows(leagueTeams.france),
    columns: [country("Brazil"), country("Argentina"), trophy("FIFA World Cup Winner", "Won World Cup")],
  },
  {
    id: "netherlands", name: "Netherlands", emblem: "ERE", flag: "nl",
    description: "Eredivisie clubs, Dutch internationals and European champions.",
    competition: "Eredivisie", season: DATA_SEASON,
    teams: leagueTeams.netherlands,
    sourceUrl: "https://eredivisie.nl/nieuws/eerste-speelronde-2026-27/",
    rows: leagueRows(leagueTeams.netherlands),
    columns: [country("Netherlands"), country("Brazil"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "argentina", name: "Argentina", emblem: "LPF", flag: "ar",
    description: "Primera División clubs, national heroes and World Cup winners.",
    competition: "Liga Profesional de Fútbol", season: "2026",
    teams: leagueTeams.argentina,
    sourceUrl: "https://www.afa.com.ar/o/posts/agenda-para-la-temporada-2026-de-la-liga-profesional",
    rows: leagueRows(leagueTeams.argentina),
    columns: [country("Argentina"), country("Brazil"), trophy("FIFA World Cup Winner", "Won World Cup")],
  },
  {
    id: "brazil", name: "Brazil", emblem: "BR A", flag: "br",
    description: "Brasileirão clubs, Seleção stars and global honors.",
    competition: "Campeonato Brasileiro Série A", season: "2026",
    teams: leagueTeams.brazil,
    sourceUrl: "https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026",
    rows: leagueRows(leagueTeams.brazil),
    columns: [country("Brazil"), country("Argentina"), trophy("FIFA World Cup Winner", "Won World Cup")],
  },
].map((league) => ({
  ...league,
  dataSeason: DATA_SEASON,
  dataAsOf: DATA_AS_OF,
}));

export const gridGrids = stampDataset(footballGridJson.grids);
export const gridRows = gridGrids[0]?.rows || [];
export const gridColumns = gridGrids[0]?.columns || [];

export default { leagueOptions, gridGrids, gridPlayers, gridCountries, gridCompetitionRows, dataSeason: DATA_SEASON, dataAsOf: DATA_AS_OF };
