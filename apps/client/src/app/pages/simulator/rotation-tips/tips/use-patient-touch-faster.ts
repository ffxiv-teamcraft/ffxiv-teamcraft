import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Buff, PatientTouch, SimulationResult } from '@ffxiv-teamcraft/simulator';

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
      return clone.getBuff(Buff.INNER_QUIET) && clone.getBuff(Buff.INNER_QUIET).stacks > 1;
    });
  }

}
