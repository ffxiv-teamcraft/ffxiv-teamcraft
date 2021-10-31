import { FishingBait } from '../../../core/data/model/fishing-bait';
import { I18nName } from '../../../model/common/i18n-name';

export interface StoredNode {
  id?: number;
  zoneid: number;
  areaid: number;
  mapid: number;
  level: number;
  limitType?: I18nName;
  type?: number;
  coords?: number[];
  time?: number[];
  uptime?: number;
  slot?: number | string;
  baits?: FishingBait[];
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
  predators?: { id: number, icon: number, amount: number }[];
  gig?: string;
  hookset?: string;
  hidden?: boolean;
}
