import { VesselType } from './vessel-type';

export interface VesselTimersUpdate {
  type: VesselType;
  timers: { name: string, returnTime: number, destinations: number[] }[];
}
