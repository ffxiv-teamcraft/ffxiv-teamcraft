import {ActionResult} from '../model/action-result';

export interface SimulationResult {
    steps: ActionResult[];
    hqPercent: number;
    success: boolean;
}
