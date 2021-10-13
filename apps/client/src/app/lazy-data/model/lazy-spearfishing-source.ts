export interface LazySpearfishingSource {
  gig:        Gig;
  predators?: Predator[];
  spawn?:     number;
  duration?:  number;
}

export enum Gig {
  Large = "Large",
  Normal = "Normal",
  Small = "Small",
}

export interface Predator {
  id:     number;
  amount: number;
}
