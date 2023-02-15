export interface LazySeed {
  crossBreeds: CrossBreed[];
  duration:    number;
  seedItemId:  number;
}

export interface CrossBreed {
  adjacentSeed: number;
  baseSeed:     number;
}
