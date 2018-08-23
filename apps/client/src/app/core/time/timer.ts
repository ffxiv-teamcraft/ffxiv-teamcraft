import { Alarm } from './alarm';

export interface Timer {
  itemId: number;
  display: string;
  time: number;
  slot: number | string;
  zoneId: number;
  areaId: number;
  coords: number[];
  type: number;
  alarm: Alarm;
}
