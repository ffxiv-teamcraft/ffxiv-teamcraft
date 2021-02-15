import { VesselType } from './vessel-type';
import { AirshipPartType } from './airship-part-type';
import { SubmarinePartType } from './submarine-part-type';

export interface VesselPartUpdate {
  type: VesselType;
  vesselSlot: string;
  partSlot: AirshipPartType | SubmarinePartType;
  partId: number;
  condition: number;
}
