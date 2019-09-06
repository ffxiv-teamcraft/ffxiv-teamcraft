export interface ModificationEntry {
  userId: string;
  amount: number;
  itemId: number;
  itemIcon: number;
  date: number;
  finalItem: boolean;
  total: number;
  recipeId?: string;
}
