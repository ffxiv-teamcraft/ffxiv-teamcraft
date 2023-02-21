interface CrossBreed {
  baseSeed: number;
  adjacentSeed: number;
}

export interface GardeningData {
  seedItemId: number;
  duration: number;
  crossBreeds: CrossBreed[];
}
