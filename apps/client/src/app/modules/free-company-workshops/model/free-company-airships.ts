import { SectorExploration } from './sector-exploration';
import { Airship } from './airship';

export interface FreeCompanyAirships {
  sectors: Record<string, SectorExploration>;
  slots: Airship[];
}
