import { I18nName } from '../../../model/common/i18n-name';

export interface StoredNode {
  zoneid: number;
  areaid: number;
  mapid: number;
  level: number;
  limitType?: I18nName;
  coords?: number[];
  time?: number[];
  uptime?: number;
  slot?: number | string;
}
