import { Submarine } from './submarine';
import { SectorExploration } from './sector-exploration';

export interface FreecompanySubmarines {
  sectors: { [id: string]: SectorExploration };
  slots: Submarine[];
}
