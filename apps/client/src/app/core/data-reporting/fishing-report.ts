import { Hookset, Tug } from '@ffxiv-teamcraft/types';

export interface FishingReport {
  itemId: number;
  etime: number;
  hq: boolean;
  mapId: number;
  weatherId: number;
  previousWeatherId: number;
  biteTime: number;
  fishEyes: boolean;
  snagging: boolean;
  chum: boolean;
  patience: boolean;
  intuition: boolean;
  mooch: boolean;
  tug: Tug;
  hookset: Hookset;
  spot: number;
  size: number;

  userId?: string;
  date?: number;
  trainId?: string;
  baitId?: number;
  stats?: {
    gathering: number;
    perception: number;
    gp: number;
  };
}

export type TrainFishingReport = Pick<FishingReport, 'itemId' | 'date' | 'baitId' | 'mooch' | 'size' | 'trainId'> & { name: string }
