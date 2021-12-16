import { Vessel } from './vessel';
import { VesselPart } from './vessel-part';
import { AirshipPartType } from './airship-part-type';

export interface Airship extends Vessel {
  parts?: Record<AirshipPartType, VesselPart>;
}
