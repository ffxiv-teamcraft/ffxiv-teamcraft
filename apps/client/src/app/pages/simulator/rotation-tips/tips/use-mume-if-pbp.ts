import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '../../simulation/simulation-result';
import { PieceByPiece } from '../../model/actions/progression/piece-by-piece';
import { MuscleMemory } from '../../model/actions/progression/muscle-memory';
import { InitialPreparations } from '../../model/actions/buff/initial-preparations';
import { MakersMark } from '../../model/actions/buff/makers-mark';

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
