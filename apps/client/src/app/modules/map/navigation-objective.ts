import { Vector2 } from '../../core/tools/vector2';
import { I18nName } from '../../model/common/i18n-name';

export interface NavigationObjective extends Vector2 {
  mapId?: number;
  zoneId?: number;
  name: I18nName;
  iconid?: number;
  item_amount?: number;
  total_item_amount?: number;
  itemId?: number;
  type?: 'Gathering' | 'Hunting' | 'Vendor' | 'Trade';
  gatheringType?: number;
}
