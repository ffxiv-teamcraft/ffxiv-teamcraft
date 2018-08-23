import { SimulationResult } from './simulation-result';

export interface SimulationReliabilityReport {
  rawData: SimulationResult[];
  successPercent: number;
  medianHQPercent: number;
  averageHQPercent: number;
}
