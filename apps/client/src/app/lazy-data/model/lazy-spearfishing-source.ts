export interface LazySpearfishingSource {
  speed:      number;
  shadowSize: number;
  spawn?:     number;
  duration?:  number;
  predators?: Predator[];
}

export interface Predator {
  id:     number;
  amount: number;
}
