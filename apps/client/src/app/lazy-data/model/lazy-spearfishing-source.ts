export interface LazySpearfishingSource {
  speed:      number;
  shadowSize: number;
  predators?: Predator[];
  spawn?:     number;
  duration?:  number;
}

export interface Predator {
  id:     number;
  amount: number;
}
