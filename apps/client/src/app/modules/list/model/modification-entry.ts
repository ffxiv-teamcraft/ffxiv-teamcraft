import { DataModel } from '../../../core/database/storage/data-model';

export class ModificationEntry extends DataModel {
  userId: string;
  amount: number;
  itemId: number;
  date: number;
  finalItem: boolean;
  total: number;
  recipeId?: string;
}
