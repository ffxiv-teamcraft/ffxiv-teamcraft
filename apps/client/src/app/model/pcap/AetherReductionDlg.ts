import { ActorControl } from './ActorControl';

export interface AetherReductionDlg extends ActorControl {
  reducedItemID: number;
  resultItems: {
    itemId: number;
    hq: boolean;
    quantity: number;
  }[];
}