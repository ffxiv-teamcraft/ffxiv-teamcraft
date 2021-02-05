import { Vessel } from './vessel';
import { VesselPart } from './vessel-part';

export interface Airship extends Vessel {
  parts?: {
    hull: VesselPart;
    rigging: VesselPart;
    forecastle: VesselPart;
    aftcastle: VesselPart;
  }
}
