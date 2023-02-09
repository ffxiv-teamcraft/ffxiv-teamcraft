import { I18nName } from '@ffxiv-teamcraft/types';

export interface Fate {
  name: I18nName;
  description: I18nName;
  icon: string;
  level: number;
  position?: {
    map: number;
    zoneid: number;
    x: number;
    y: number;
    z: number;
  };
}
