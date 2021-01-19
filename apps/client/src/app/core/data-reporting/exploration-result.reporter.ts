export enum ExplorationType {
  AIRSHIP,
  SUBMARINE
}

export interface ExplorationResultReporter {
  getExplorationType(): ExplorationType;
}
