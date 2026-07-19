import { PayoutEntry } from './payout-entry';

export interface BoardCell {
  row: number;
  col: number;
  value: number | null;
}

export interface LineResult {
  cells: BoardCell[];
  sum: number;
  payout: number;
  expectedValue: number;
}

export { PayoutEntry };