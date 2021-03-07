import { Submarine } from './submarine';
import { SectorExploration } from './sector-exploration';

export interface FreeCompanySubmarines {
  sectors: Record<string, SectorExploration>;
  slots: Submarine[];
}
