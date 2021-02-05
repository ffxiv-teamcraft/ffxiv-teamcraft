import { VesselPart } from './vessel-part';

export interface SubmarineBuild {
  hull: VesselPart;
  stern: VesselPart;
  bow: VesselPart;
  bridge: VesselPart;
}
