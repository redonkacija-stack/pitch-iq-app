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
}));

export default gameModesData;
