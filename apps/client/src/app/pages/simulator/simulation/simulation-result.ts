import { ActionResult } from '../model/action-result';
import { Simulation } from './simulation';
import { SimulationFailCause } from '../model/simulation-fail-cause.enum';

export interface SimulationResult {
  steps: ActionResult[];
  hqPercent: number;
  success: boolean;
  simulation: Simulation;
  failCause?: string;
}
