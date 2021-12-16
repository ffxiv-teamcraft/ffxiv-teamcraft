export interface LazyFishingSource {
  spot:              number;
  hookset?:          number;
  tug:               number;
  bait:              number;
  snagging?:         boolean;
  spawn?:            number;
  duration?:         number;
  weathers?:         number[];
  predators?:        Predator[];
  weathersFrom?:     number[];
  oceanFishingTime?: number;
}

export interface Predator {
  id:     number;
  amount: number;
}
