import * as Simulator from '@ffxiv-teamcraft/simulator';
import * as SimulatorKR from '@ffxiv-teamcraft/simulator-kr';
import * as SimulatorCN from '@ffxiv-teamcraft/simulator-cn';
import { Region } from '../../modules/settings/region.enum';

export function getSimulator(region: Region): typeof Simulator {
  switch (region) {
    case Region.Korea:
      return SimulatorKR as any;
    case Region.China:
      return SimulatorCN as any;
    default:
      return Simulator;
  }
}