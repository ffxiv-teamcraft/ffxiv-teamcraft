import { ConsumableRow } from './consumable-row';

export interface DefaultConsumables {
  food: ConsumableRow;
  medicine: ConsumableRow;
  fcBuffs: [number, number];
}
