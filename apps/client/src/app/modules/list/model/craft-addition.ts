import { CustomItem } from '../../custom-items/model/custom-item';
import { ListRow } from './list-row';

export interface CraftAddition {
  item?: ListRow;
  data?: CustomItem;
  amount: number;
}
