import gameModesData from "./gameModes.json";

export const matchModes = gameModesData.map((m) => ({
  id: m.id,
  label: m.title,
  detail: m.shortDesc,
  badge: m.badge,
  category: m.category,
  description: m.description,
  players: m.players,
  icon: m.icon,
  iconUrl: m.iconUrl,
  difficulty: m.difficulty,
  duration: m.duration,
  leagueMarks: m.leagueMarks,
}));

export default gameModesData;
