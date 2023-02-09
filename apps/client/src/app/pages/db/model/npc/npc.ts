import { I18nName } from '@ffxiv-teamcraft/types';

export interface Npc extends I18nName {
  defaultTalks: number[];
  position?: {
    map: number;
    zoneid: number;
    x: number;
    y: number;
    z: number;
  };
}
