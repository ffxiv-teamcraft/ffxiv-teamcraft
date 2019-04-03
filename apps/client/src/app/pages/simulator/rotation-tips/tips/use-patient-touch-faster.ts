import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '../../simulation/simulation-result';
import { PatientTouch } from '../../model/actions/quality/patient-touch';
import { Buff } from '../../model/buff.enum';

export class UsePatientTouchFaster extends RotationTip {

  constructor() {
    super(RotationTipType.WARNING, 'Use_patient_touch_faster');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, PatientTouch);
  }

  matches(simulationResult: SimulationResult): boolean {
    const patientTouchIndexes = this.getAllActionIndexes(simulationResult, PatientTouch);
    return patientTouchIndexes.some(index => {
      const clone = simulationResult.simulation.clone();
      clone.run(true, index);
      return clone.getBuff(Buff.INNER_QUIET).stacks > 1;
    });
  }

}
