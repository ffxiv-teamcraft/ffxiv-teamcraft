import { ItemData } from '../../../model/garland-tools/item-data';
import { CommissionTag } from '../../../modules/commission-board/model/commission-tag';

export interface CommissionImportTemplate {
  name: string;
  price: number;
  items: { itemData: ItemData, quantity: number, recipeId?: string }[];
  tags: CommissionTag[];
  url: string;
  description?: string;
  contactInfo?: string;
}
