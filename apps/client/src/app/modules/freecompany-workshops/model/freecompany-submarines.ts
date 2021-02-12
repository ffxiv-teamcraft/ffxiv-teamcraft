import { Submarine } from './submarine';
import { SectorExploration } from './sector-exploration';

export interface FreecompanySubmarines {
  sectors: Record<string, SectorExploration>;
  slots: Submarine[];
}
