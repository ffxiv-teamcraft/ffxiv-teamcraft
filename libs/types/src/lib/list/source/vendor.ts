import { Vector2 } from '../../core/vector2';
import { I18nName } from '../../i18n-name';

export interface Vendor {
  npcId: number;
  zoneId?: number;
  mapId?: number;
  areaId?: number;
  price: number;
  coords?: Vector2;
  festival?: number;
  shopName?: I18nName;
}
