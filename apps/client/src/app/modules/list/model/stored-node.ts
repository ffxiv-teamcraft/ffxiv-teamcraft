import { I18nName } from '../../../model/common/i18n-name';
import { FishingBait } from './fishing-bait';

export interface StoredNode {
  id?: number;
  zoneid: number;
  areaid: number;
  mapid: number;
  level: number;
  limitType?: I18nName;
  coords?: number[];
  time?: number[];
  uptime?: number;
  slot?: number | string;
  baits?: FishingBait[];
  weathers?: number[];
  weathersFrom?: number[];
  fishEyes?: boolean;
  snagging?: boolean;
  predators?: { id: number, icon: number, amount: number }[];
  gig?: string;
  hookset?: string;
}
