import footballGridJson from "./footballGrid.json";
import { DATA_AS_OF, DATA_SEASON, stampDataset } from "./seasonConfig";

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

const leagueRows = (teams) => teams.map((team) => club(team));

export const leagueOptions = [
  {
    id: "global", name: "Global", emblem: "WORLD", flag: null,
    description: "World football, continental champions and international icons.",
    competition: "Global / UEFA Champions League", season: DATA_SEASON,
    teams: ["Real Madrid", "Barcelona", "Bayern Munich"],
    sourceUrl: "https://www.uefa.com/uefachampionsleague/news/02a8-2171a88881a0-c70193b972c6-1000--meet-the-2026-27-champions-league-league-phase-teams/",
    rows: [manager("Pep Guardiola"), manager("Carlo Ancelotti", "Coached by Carlo Ancelotti"), manager("Hansi Flick", "Managed by Hansi Flick")],
    columns: [country("Argentina"), country("Brazil"), country("Germany")],
  },
  {
    id: "england", name: "England", emblem: "PL", flag: "gb-eng",
    description: "Premier League clubs, international stars and major honors.",
    competition: "Premier League", season: DATA_SEASON,
    teams: ["Arsenal", "Chelsea", "Manchester City"],
    sourceUrl: "https://www.premierleague.com/en/news/4673099/the-202627-premier-league-season-officially-starts",
    rows: leagueRows(["Arsenal", "Chelsea", "Manchester City"]),
    columns: [country("France"), country("Brazil"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "spain", name: "Spain", emblem: "LL", flag: "es",
    description: "La Liga giants, nationalities and European honors.",
    competition: "LALIGA EA SPORTS", season: DATA_SEASON,
    teams: ["Real Madrid", "Barcelona", "Atlético de Madrid"],
    sourceUrl: "https://www.laliga.com/en-US/laliga-easports/clubs",
    rows: leagueRows(["Real Madrid", "Barcelona", "Atlético Madrid"]),
    columns: [country("France"), country("Brazil"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "italy", name: "Italy", emblem: "SA", flag: "it",
    description: "Serie A clubs, nationalities and trophy-winning players.",
    competition: "Serie A", season: DATA_SEASON,
    teams: ["AC Milan", "Inter Milan", "Juventus"],
    sourceUrl: "https://en.legaseriea.it/serie-a/news/looking-forward-to-the-2026-27-serie-a-fixture-list",
    rows: leagueRows(["AC Milan", "Inter Milan", "Juventus"]),
    columns: [country("Argentina"), country("France"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "france", name: "France", emblem: "L1", flag: "fr",
    description: "Ligue 1 clubs, world champions and global football stars.",
    competition: "Ligue 1 McDonald's", season: DATA_SEASON,
    teams: ["Paris Saint-Germain", "Monaco", "Lyon"],
    sourceUrl: "https://ligue1.com/fr/articles/l1_article_5284-",
    rows: leagueRows(["Paris Saint-Germain", "Monaco", "Lyon"]),
    columns: [country("Brazil"), country("Argentina"), trophy("FIFA World Cup Winner", "Won World Cup")],
  },
  {
    id: "netherlands", name: "Netherlands", emblem: "ERE", flag: "nl",
    description: "Eredivisie clubs, Dutch internationals and European champions.",
    competition: "Eredivisie", season: DATA_SEASON,
    teams: ["Ajax", "PSV Eindhoven", "Feyenoord"],
    sourceUrl: "https://eredivisie.nl/nieuws/eerste-speelronde-2026-27/",
    rows: leagueRows(["Ajax", "PSV Eindhoven", "Feyenoord"]),
    columns: [country("Netherlands"), country("Brazil"), trophy("Champions League Winner", "Won Champions League")],
  },
  {
    id: "argentina", name: "Argentina", emblem: "LPF", flag: "ar",
    description: "Primera División clubs, national heroes and World Cup winners.",
    competition: "Liga Profesional de Fútbol", season: "2026",
    teams: ["Boca Juniors", "River Plate", "Racing Club"],
    sourceUrl: "https://www.afa.com.ar/o/posts/agenda-para-la-temporada-2026-de-la-liga-profesional",
    rows: leagueRows(["Boca Juniors", "River Plate", "Racing Club"]),
    columns: [country("Argentina"), country("Brazil"), trophy("FIFA World Cup Winner", "Won World Cup")],
  },
  {
    id: "brazil", name: "Brazil", emblem: "BR A", flag: "br",
    description: "Brasileirão clubs, Seleção stars and global honors.",
    competition: "Campeonato Brasileiro Série A", season: "2026",
    teams: ["Santos FC", "Flamengo", "Corinthians"],
    sourceUrl: "https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026",
    rows: leagueRows(["Santos FC", "Flamengo", "Corinthians"]),
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

export default { leagueOptions, gridGrids, gridPlayers, dataSeason: DATA_SEASON, dataAsOf: DATA_AS_OF };
