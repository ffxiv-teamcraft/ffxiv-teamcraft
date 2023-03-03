import { LazyFishingSpot } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot';
import { Tug } from '@ffxiv-teamcraft/types';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';

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
  train?: PersistedFishTrain;
  wrongSpot?: boolean;
  reports: any[];
}
