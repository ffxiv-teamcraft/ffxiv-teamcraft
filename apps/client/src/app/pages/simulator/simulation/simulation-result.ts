import { ActionResult } from '../model/action-result';
import { Simulation } from './simulation';

export interface SimulationResult {
  steps: ActionResult[];
  hqPercent: number;
  success: boolean;
  simulation: Simulation;
}
