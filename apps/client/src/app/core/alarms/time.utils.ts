export class TimeUtils {
  static getIntersection(_spawnRange: [number, number], _weatherSpawnRange: [number, number]): [number, number] | null {
    const spawnRange = TimeUtils.prepareRange(_spawnRange);
    const weatherSpawnRange = TimeUtils.prepareRange(_weatherSpawnRange);
    const min = spawnRange[0] < weatherSpawnRange[0] ? spawnRange : weatherSpawnRange;
    const max = min === spawnRange ? weatherSpawnRange : spawnRange;
    if (min[1] <= max[0]) {
      return null;
    }
    return [max[0] % 24, (min[1] < max[1] ? min[1] : max[1] % 24)];
  }

  static prepareRange(range: [number, number]): [number, number] {
    return [range[0], range[1] < range[0] ? range[1] + 24 : range[1]];
  }
}
