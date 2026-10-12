import gameModesData from "./gameModes.json";
import { DATA_SEASON, DATA_AS_OF, stampDataset } from "./seasonConfig";

export { DATA_SEASON, DATA_AS_OF };
export const matchModes = stampDataset(gameModesData.map((m) => ({
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
})));

export default matchModes;
