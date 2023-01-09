import { Observable } from 'rxjs';
import { Vector2 } from '../../core/tools/vector2';
import { I18nName } from '../../model/common/i18n-name';
import { ListRow } from '../list/model/list-row';

export interface NavigationObjective extends Vector2 {
  mapId?: number;
  zoneId?: number;
  name?: I18nName | Observable<I18nName> | string | Observable<string>;
  iconid?: number;
  item_amount?: number;
  total_item_amount?: number;
  itemId?: number;
  type?: 'Gathering' | 'Hunting' | 'Vendor' | 'Trade';
  gatheringType?: number;
  fate?: number;
  monster?: number;
  finalItem?: boolean;
  listRow?: ListRow;
}
