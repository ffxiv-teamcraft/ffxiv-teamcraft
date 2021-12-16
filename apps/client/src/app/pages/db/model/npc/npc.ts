import { I18nName } from '../../../../model/common/i18n-name';

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
