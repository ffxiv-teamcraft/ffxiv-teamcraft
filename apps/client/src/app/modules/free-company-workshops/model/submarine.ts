import { Vessel } from './vessel';
import { VesselPart } from './vessel-part';
import { SubmarinePartType } from './submarine-part-type';

export interface Submarine extends Vessel {
  parts?: Record<SubmarinePartType, VesselPart>;
}
