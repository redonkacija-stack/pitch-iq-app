import marketPlayersJson from "./marketValues.json";
import gridDataJson from "./footballGrid.json";
import mysteryPlayersJson from "./whoAmI.json";
import varQuestionsJson from "./varCall.json";
import duoLinksJson from "./duoLinks.json";

export const marketPlayers = marketPlayersJson;

export const gridRows = gridDataJson.grids[0].rows;
export const gridColumns = gridDataJson.grids[0].columns;
export const gridGrids = gridDataJson.grids;
export const gridPlayers = gridDataJson.players;

export const mysteryPlayers = mysteryPlayersJson;

export const varQuestions = varQuestionsJson;

export const duoLinks = duoLinksJson;
