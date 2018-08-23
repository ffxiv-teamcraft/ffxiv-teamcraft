import { FishingSpot } from './fishing-spot';

export interface Fish {
  guide: string;
  icon: number;
  spots: FishingSpot[];
  folklore?: number;
}
