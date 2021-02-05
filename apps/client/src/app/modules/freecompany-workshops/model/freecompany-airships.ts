import { SectorExploration } from './sector-exploration';
import { Airship } from './airship';

export interface FreecompanyAirships {
  sectors: { [id: string]: SectorExploration };
  slots: Airship[];
}
