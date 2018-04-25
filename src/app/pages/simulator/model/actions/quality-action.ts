import {Simulation} from '../../simulation/simulation';
import {GeneralAction} from './general-action';

export abstract class QualityAction extends GeneralAction {
    private static QUALITY_PENALTY_TABLE = {
        0: -0.02,
        90: -0.03,
        160: -0.05,
        180: -0.06,
        200: -0.07,
        245: -0.08,
        300: -0.09,
        310: -0.10,
        340: -0.11,
    };

    execute(simulation: Simulation): void {
        // TODO
    }

}
