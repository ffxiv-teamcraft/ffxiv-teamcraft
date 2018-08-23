import { ConsumableStat } from './consumable-stat';

export interface ConsumableDataRow {
  itemId: number;

  CP?: ConsumableStat[];

  Crafsmanship?: ConsumableStat[];

  Control?: ConsumableStat[];
}
