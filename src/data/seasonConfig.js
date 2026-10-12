// Static data shipped in this build is frozen to this audit snapshot.
// Historical career and trophy facts keep their original meaning; active status
// fields use the snapshot date instead of the ambiguous word "present".
export const DATA_SEASON = "2026/27";
export const DATA_AS_OF = "2026-10-12";
export const DATA_REVISION = "2026-10-12.1";

export function stampDataset(records) {
  return records.map((record) => ({
    ...record,
    dataSeason: DATA_SEASON,
    dataAsOf: DATA_AS_OF,
  }));
}
