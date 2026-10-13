export interface SpendingEntry {
  price: number;
  itemID: number;
  rate?: number;
  npcs?: number[];
  HQ?: boolean;
  score?: number;
  amountSoldLastWeek?: number;
  amount?: number;
  total?: number;
  exchangeRate?: number;

  // Permit indexing into the SpendingEntry
  [key: string]: any;
}
