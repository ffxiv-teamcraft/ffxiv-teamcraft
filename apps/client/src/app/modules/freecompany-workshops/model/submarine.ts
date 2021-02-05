import { Vessel } from './vessel';
import { VesselPart } from './vessel-part';

export interface Submarine extends Vessel {
  parts?: {
    hull: VesselPart;
    stern: VesselPart;
    bow: VesselPart;
    bridge: VesselPart;
  }
}
