import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import {
  InitialPreparations,
  MakersMark,
  MuscleMemory,
  PieceByPiece,
  SimulationResult
} from '@ffxiv-teamcraft/simulator';

export class UseMumeIfPbp extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_mume_if_pbp');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.action.is(PieceByPiece)) && this.crafterHasActions(simulationResult, MuscleMemory);
  }

  matches(simulationResult: SimulationResult): boolean {
    const firstAction = simulationResult.steps[0].action;
    return !firstAction.is(MuscleMemory) && !firstAction.is(InitialPreparations) && !firstAction.is(MakersMark);
  }

}
