import { LazyFishingSpot } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot';
import { Tug } from '../../data/model/tug';

export interface FishingReporterState {
  isFishing: boolean;
  mapId: number;
  baitId: number;
  spot?: LazyFishingSpot;
  stats?: {
    gathering: number;
    perception: number;
    gp: number;
  };
  mooch?: number;
  statuses: number[];
  weatherId: number;
  previousWeatherId: number;
  throwData?: any | null;
  biteData: {
    timestamp: number,
    tug: Tug
  };
  reports: any[];
}
