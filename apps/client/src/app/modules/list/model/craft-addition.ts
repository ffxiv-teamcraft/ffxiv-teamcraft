import { ItemData } from '../../../model/garland-tools/item-data';
import { CustomItem } from '../../custom-items/model/custom-item';

export interface CraftAddition {
  item: any;
  data: ItemData | CustomItem;
  amount: number;
}
