import { careers, matches, profiles } from "./gameData";
import { DATA_SEASON, DATA_AS_OF, DATA_REVISION } from "./seasonConfig";

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hashDate(value) {
  return [...value].reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );
}

export function getDailySet(date = new Date()) {
  const key = dateKey(date);
  const storageKey = `pitchiq:daily-set:${DATA_REVISION}:${key}`;
  const datasets = { lineup: matches, transfer: careers, tactics: profiles };
  let indices;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      saved &&
      Object.keys(datasets).every(
        (mode) =>
          Number.isInteger(saved[mode]) &&
          saved[mode] >= 0 &&
          saved[mode] < datasets[mode].length,
      )
    )
      indices = saved;
  } catch {
    indices = undefined;
  }
  if (!indices) {
    const seed = hashDate(key);
    indices = {
      lineup: seed % matches.length,
      transfer: Math.floor(seed / 7) % careers.length,
      tactics: Math.floor(seed / 13) % profiles.length,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(indices));
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
  }
  return {
    date: key,
    dataSeason: DATA_SEASON,
    dataAsOf: DATA_AS_OF,
    lineup: matches[indices.lineup],
    transfer: careers[indices.transfer],
    tactics: profiles[indices.tactics],
  };
}
