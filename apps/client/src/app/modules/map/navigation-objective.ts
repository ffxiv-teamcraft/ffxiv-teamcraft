import { Vector2 } from '../../core/tools/vector2';
import { I18nName } from '../../model/common/i18n-name';

export interface NavigationObjective extends Vector2 {
  name: I18nName;
  iconid?: number;
  item_amount?: number;
  type?: 'Gathering' | 'Hunting' | 'Vendor' | 'Trade';
}
