import { VesselPart } from './vessel-part';

export interface AirshipBuild {
  hull: VesselPart;
  rigging: VesselPart;
  forecastle: VesselPart;
  aftcastle: VesselPart;
}
