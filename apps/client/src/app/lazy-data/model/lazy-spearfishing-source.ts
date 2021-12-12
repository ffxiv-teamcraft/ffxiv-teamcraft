import { SpearfishingSpeed } from '../../core/data/model/spearfishing-speed';
import { SpearfishingShadowSize } from '../../core/data/model/spearfishing-shadow-size';

export interface LazySpearfishingSource {
  gig: Gig;
  predators?: Predator[];
  spawn?: number;
  duration?: number;
  speed?: SpearfishingSpeed;
  shadowSize?: SpearfishingShadowSize;
}

export enum Gig {
  Large = 'Large',
  Normal = 'Normal',
  Small = 'Small',
}

export interface Predator {
  id: number;
  amount: number;
}
