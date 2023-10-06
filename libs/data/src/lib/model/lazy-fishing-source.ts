export interface LazyFishingSource {
  bait:              number;
  duration?:         number;
  hookset?:          number;
  minGathering:      number;
  oceanFishingTime?: number;
  predators?:        Predator[];
  snagging?:         boolean;
  spawn?:            number;
  spot:              number;
  tug:               number;
  video?:            string;
  weathers?:         number[];
  weathersFrom?:     number[];
}

export interface Predator {
  amount: number;
  id:     number;
}
