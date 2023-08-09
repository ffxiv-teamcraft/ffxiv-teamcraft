import { CommissionTag } from '../../../modules/commission-board/model/commission-tag';

export interface CommissionImportTemplate {
  name: string;
  price: number;
  items: { id: number, quantity: number, recipeId?: string }[];
  tags: CommissionTag[];
  url: string;
  description?: string;
  contactInfo?: string;
}
