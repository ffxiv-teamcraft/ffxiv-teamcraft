import {ActionResult} from '../model/action-result';

export interface SimulationResult {
    progressionValue: number;
    qualityValue: number;
    finalCP: number;
    steps: ActionResult[];
    hqPercent: number;
    success: boolean;
}
