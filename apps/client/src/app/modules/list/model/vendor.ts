import { I18nName } from '../../../model/common/i18n-name';
import { Vector2 } from '../../../core/tools/vector2';

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
