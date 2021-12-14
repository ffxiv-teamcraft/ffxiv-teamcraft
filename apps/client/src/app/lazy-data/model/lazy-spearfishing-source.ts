import { SpearfishingSpeed } from '../../core/data/model/spearfishing-speed';
import { SpearfishingShadowSize } from '../../core/data/model/spearfishing-shadow-size';

export interface LazySpearfishingSource {
  predators?: Predator[];
  spawn?: number;
  duration?: number;
  speed?: SpearfishingSpeed;
  shadowSize?: SpearfishingShadowSize;
}

export interface Predator {
  id: number;
  amount: number;
}
