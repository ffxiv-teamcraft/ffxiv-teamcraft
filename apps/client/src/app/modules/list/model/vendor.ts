import { I18nName } from '@ffxiv-teamcraft/types';
import { Vector2 } from '@ffxiv-teamcraft/types';

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
