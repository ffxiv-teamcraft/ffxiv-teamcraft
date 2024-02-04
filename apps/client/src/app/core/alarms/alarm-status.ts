export interface AlarmSpawn {
  date: Date;
  despawn: Date;
  weather?: number;
}

export interface AlarmStatus {
  spawned: boolean;
  previousSpawn: AlarmSpawn;
  /**
   * Next time this will spawn, can be in the past if the node is currently spawned
   *
   * Contains current spawn when the node is spawned
   */
  nextSpawn: AlarmSpawn;
  // Next time this will spawn after the next spawn (basically second spawn)
  secondNextSpawn: AlarmSpawn;
}
