import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import {
  ComfortZone,
  InitialPreparations,
  MakersMark,
  MuscleMemory,
  SimulationResult
} from '@ffxiv-teamcraft/simulator';

export class UseCzEarlier extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_cz_earlier');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, ComfortZone);
  }

  matches(simulationResult: SimulationResult): boolean {
    const firstAction = simulationResult.steps[0] && simulationResult.steps[0].action;
    if (firstAction.is(MuscleMemory) || firstAction.is(MakersMark) || firstAction.is(InitialPreparations)) {
      return false;
    }
    return (simulationResult.steps.findIndex(step => step.action.is(ComfortZone)) > 3
      || simulationResult.steps.slice(-8).some(step => step.action.is(ComfortZone)))
      && simulationResult.steps.length > 8;
  }

}
