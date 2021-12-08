import { I18nName } from '../../../model/common/i18n-name';

export interface Vendor {
  npcId: number;
  zoneId?: number;
  mapId?: number;
  areaId?: number;
  price: number;
  coords?: { x: number; y: number; };
  festival?: number;
  shopName?: I18nName;
}
