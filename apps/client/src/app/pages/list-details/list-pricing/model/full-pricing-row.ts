import { Price } from './price';
import { ItemAmount } from './item-amount';


export type ListArray = 'items' | 'finalItems';

export interface FullPricingRow {
  id: number;
  use: boolean;
  custom: boolean;
  price: Price;
  amount: ItemAmount;
  array: ListArray;
}
