import triviaInvasionJson from "./triviaInvasion.json";
import { stampDataset, DATA_SEASON, DATA_AS_OF } from "./seasonConfig";

export { DATA_SEASON, DATA_AS_OF };
export const invasionTiers = stampDataset(triviaInvasionJson.tiers);
export const invasionPlayers = stampDataset(triviaInvasionJson.players);

export default { ...triviaInvasionJson, tiers: invasionTiers, players: invasionPlayers, dataSeason: DATA_SEASON, dataAsOf: DATA_AS_OF };
