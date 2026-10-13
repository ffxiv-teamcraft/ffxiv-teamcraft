import * as Simulator from '@ffxiv-teamcraft/simulator';
import { Region } from '@ffxiv-teamcraft/types';

export function getSimulator(region: Region): typeof Simulator {
  switch (region) {
    case Region.Korea:
    case Region.China:
    default:
      return Simulator;
  }
}
