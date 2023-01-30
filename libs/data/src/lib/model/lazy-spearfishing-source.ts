export interface LazySpearfishingSource {
  duration?:  number;
  predators?: Predator[];
  shadowSize: number;
  spawn?:     number;
  speed:      number;
}

export interface Predator {
  amount: number;
  id:     number;
}
