export interface AlarmSpawn {
  date: Date;
  despawn: Date;
  weather?: number;
}

export interface AlarmStatus {
  spawned: boolean;
  previousSpawn: AlarmSpawn;
  // Next time this will spawn, cannot be in the past
  nextSpawn: AlarmSpawn;
  // Next time this will spawn after the next spawn (basically second spawn)
  secondNextSpawn: AlarmSpawn;
}
