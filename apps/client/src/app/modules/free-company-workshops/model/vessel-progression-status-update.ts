import { VesselType } from './vessel-type';
import { SectorExploration } from './sector-exploration';

export interface VesselProgressionStatusUpdate {
  type: VesselType;
  sectorsProgression: Record<string, SectorExploration>;
}
