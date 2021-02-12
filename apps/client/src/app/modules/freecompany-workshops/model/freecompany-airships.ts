import { SectorExploration } from './sector-exploration';
import { Airship } from './airship';

export interface FreecompanyAirships {
  sectors: Record<string, SectorExploration>;
  slots: Airship[];
}
