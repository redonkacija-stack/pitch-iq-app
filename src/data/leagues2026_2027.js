import { leagueTeams } from "./leagueTeams";

export const SEASON_2026_2027 = "2026/27";

const playersByClub = {
  Arsenal: ["David Raya|GK|Spain|88", "William Saliba|DEF|France|90", "Gabriel Magalhaes|DEF|Brazil|88", "Declan Rice|MID|England|91", "Martin Odegaard|MID|Norway|89", "Bukayo Saka|ATT|England|91", "Kai Havertz|ATT|Germany|86", "Gabriel Jesus|ATT|Brazil|83"],
  "Manchester City": ["Gianluigi Donnarumma|GK|Italy|89", "Ruben Dias|DEF|Portugal|88", "Josko Gvardiol|DEF|Croatia|87", "Rodri|MID|Spain|92", "Phil Foden|MID|England|89", "Bernardo Silva|MID|Portugal|88", "Jeremy Doku|ATT|Belgium|85", "Erling Haaland|ATT|Norway|92"],
  "Manchester United": ["Andre Onana|GK|Cameroon|82", "Matthijs de Ligt|DEF|Netherlands|85", "Lisandro Martinez|DEF|Argentina|84", "Bruno Fernandes|MID|Portugal|89", "Kobbie Mainoo|MID|England|82", "Mason Mount|MID|England|81", "Marcus Rashford|ATT|England|84", "Benjamin Sesko|ATT|Slovenia|84"],
  Liverpool: ["Alisson Becker|GK|Brazil|89", "Virgil van Dijk|DEF|Netherlands|89", "Ibrahima Konate|DEF|France|86", "Alexis Mac Allister|MID|Argentina|87", "Dominik Szoboszlai|MID|Hungary|85", "Florian Wirtz|MID|Germany|90", "Mohamed Salah|ATT|Egypt|90", "Cody Gakpo|ATT|Netherlands|85"],
  Barcelona: ["Joan Garcia|GK|Spain|84", "Jules Kounde|DEF|France|88", "Pau Cubarsi|DEF|Spain|86", "Pedri|MID|Spain|91", "Gavi|MID|Spain|86", "Frenkie de Jong|MID|Netherlands|88", "Lamine Yamal|ATT|Spain|92", "Raphinha|ATT|Brazil|89"],
  "Real Madrid": ["Thibaut Courtois|GK|Belgium|90", "Antonio Rudiger|DEF|Germany|87", "Eder Militao|DEF|Brazil|86", "Jude Bellingham|MID|England|92", "Federico Valverde|MID|Uruguay|90", "Aurélien Tchouaméni|MID|France|87", "Vinicius Junior|ATT|Brazil|93", "Kylian Mbappe|ATT|France|94"],
  "AtlÃ©tico de Madrid": ["Jan Oblak|GK|Slovenia|89", "Jose Gimenez|DEF|Uruguay|85", "Robin Le Normand|DEF|Spain|85", "Marcos Llorente|MID|Spain|87", "Koke|MID|Spain|84", "Pablo Barrios|MID|Spain|83", "Antoine Griezmann|ATT|France|89", "Julian Alvarez|ATT|Argentina|90"],
  "Bayern Munich": ["Manuel Neuer|GK|Germany|87", "Dayot Upamecano|DEF|France|86", "Jonathan Tah|DEF|Germany|86", "Joshua Kimmich|MID|Germany|89", "Jamal Musiala|MID|Germany|91", "Aleksandar Pavlovic|MID|Germany|84", "Luis Diaz|ATT|Colombia|89", "Harry Kane|ATT|England|93"],
  "Borussia Dortmund": ["Gregor Kobel|GK|Switzerland|87", "Nico Schlotterbeck|DEF|Germany|86", "Waldemar Anton|DEF|Germany|84", "Felix Nmecha|MID|Germany|83", "Julian Brandt|MID|Germany|86", "Jobe Bellingham|MID|England|82", "Karim Adeyemi|ATT|Germany|85", "Serhou Guirassy|ATT|Guinea|87"],
  "Paris Saint-Germain": ["Lucas Chevalier|GK|France|86", "Marquinhos|DEF|Brazil|87", "Achraf Hakimi|DEF|Morocco|89", "Vitinha|MID|Portugal|90", "Joao Neves|MID|Portugal|88", "Warren Zaire-Emery|MID|France|86", "Ousmane Dembele|ATT|France|91", "Khvicha Kvaratskhelia|ATT|Georgia|90"],
  "Inter Milan": ["Yann Sommer|GK|Switzerland|86", "Alessandro Bastoni|DEF|Italy|89", "Denzel Dumfries|DEF|Netherlands|86", "Nicolo Barella|MID|Italy|89", "Hakan Calhanoglu|MID|Turkey|88", "Henrikh Mkhitaryan|MID|Armenia|84", "Lautaro Martinez|ATT|Argentina|91", "Marcus Thuram|ATT|France|88"],
  Juventus: ["Michele Di Gregorio|GK|Italy|85", "Bremer|DEF|Brazil|88", "Federico Gatti|DEF|Italy|83", "Manuel Locatelli|MID|Italy|84", "Teun Koopmeiners|MID|Netherlands|86", "Khephren Thuram|MID|France|85", "Kenan Yildiz|ATT|Turkey|88", "Dusan Vlahovic|ATT|Serbia|87"],
  "AC Milan": ["Mike Maignan|GK|France|88", "Fikayo Tomori|DEF|England|85", "Strahinja Pavlovic|DEF|Serbia|83", "Youssouf Fofana|MID|France|84", "Ruben Loftus-Cheek|MID|England|83", "Tijjani Reijnders|MID|Netherlands|87", "Rafael Leao|ATT|Portugal|90", "Christian Pulisic|ATT|United States|87"],
  Marseille: ["Geronimo Rulli|GK|Argentina|84", "Leonardo Balerdi|DEF|Argentina|84", "Benjamin Pavard|DEF|France|85", "Pierre-Emile Hojbjerg|MID|Denmark|85", "Mason Greenwood|ATT|England|86", "Amine Gouiri|ATT|Algeria|85"]
};

const leagueDefinitions = [
  ["england", "Premier League", "England", "GB-ENG"],
  ["spain", "La Liga", "Spain", "ES"],
  ["italy", "Serie A", "Italy", "IT"],
  ["germany", "Bundesliga", "Germany", "DE"],
  ["france", "Ligue 1", "France", "FR"],
];

const eliteClubs = new Set(["Arsenal", "Liverpool", "Manchester City", "Manchester United", "Chelsea", "Barcelona", "Real Madrid", "AtlÃ©tico de Madrid", "Bayern Munich", "Borussia Dortmund", "Paris Saint-Germain", "Inter Milan", "Juventus", "AC Milan"]);
const shortNames = { "Manchester City": "Man City", "Manchester United": "Man United", "Paris Saint-Germain": "PSG", "AtlÃ©tico de Madrid": "Atlético", "Bayern Munich": "Bayern", "Borussia Dortmund": "Dortmund" };
const normalizeClub = (name) => name === "Cremonese" ? "Venezia" : name;
const asPlayers = (clubName) => (playersByClub[clubName] || []).map((entry, index) => {
  const [name, position, nationality, rating] = entry.split("|");
  return { id: `${clubName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`, name, position, rating: Number(rating), nationality, marketValue: Math.round(Number(rating) ** 3 * 850) };
});

export const leagues2026_2027 = leagueDefinitions.map(([key, league, country, flag]) => ({
  id: key,
  name: league,
  country,
  flag,
  season: SEASON_2026_2027,
  clubs: leagueTeams[key].map(normalizeClub).map((name, index) => ({
    id: `${key}-${index + 1}`,
    name,
    shortName: shortNames[name] || name,
    crestUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(`${name} logo.svg`)}?width=128`,
    league,
    country,
    flag,
    tier: name === "Real Madrid" || name === "Barcelona" || name === "Bayern Munich" || name === "Manchester City" || name === "Paris Saint-Germain" ? 3 : eliteClubs.has(name) ? 2 : 1,
    squad: asPlayers(name),
  })),
}));

export const allLeagueClubs = leagues2026_2027.flatMap((league) => league.clubs);
export const allLeaguePlayers = allLeagueClubs.flatMap((club) => club.squad.map((player) => ({ ...player, club: club.name, league: club.league, clubId: club.id, country: club.country, clubCrestUrl: club.crestUrl })));
// Full roster packs can be injected without changing the league/club schema.
export const createLeagueDataset = (squadsByClub = {}) => leagues2026_2027.map((league) => ({
  ...league,
  clubs: league.clubs.map((club) => ({ ...club, squad: squadsByClub[club.id] || squadsByClub[club.name] || club.squad })),
}));
export const getClubById = (id) => allLeagueClubs.find((club) => club.id === id);
export const getClubByName = (name) => allLeagueClubs.find((club) => club.name.toLowerCase() === name?.toLowerCase());
export const getLeagueByName = (name) => leagues2026_2027.find((league) => league.name === name);

export default leagues2026_2027;
