import { VesselType } from './vessel-type';

export interface VesselPartUpdate {
  type: VesselType;
  vesselSlot: number;
  partSlot: number;
  condition: number;
}
