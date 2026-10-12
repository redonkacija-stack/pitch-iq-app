import marketPlayersJson from "./marketValues.json";
import mysteryPlayersJson from "./whoAmI.json";
import varQuestionsJson from "./varCall.json";
import duoLinksJson from "./duoLinks.json";
import { stampDataset, DATA_SEASON, DATA_AS_OF } from "./seasonConfig";
import { gridColumns, gridGrids, gridPlayers, gridRows, leagueOptions } from "./gridData";

export { DATA_SEASON, DATA_AS_OF, gridColumns, gridGrids, gridPlayers, gridRows, leagueOptions };

export const marketPlayers = stampDataset(marketPlayersJson);

export const mysteryPlayers = stampDataset(mysteryPlayersJson);

export const varQuestions = stampDataset(varQuestionsJson);

export const duoLinks = stampDataset(duoLinksJson);
