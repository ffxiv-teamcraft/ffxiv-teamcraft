import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { PieceByPiece, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UsePbpFirst extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_pbp_first');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.action.is(PieceByPiece));
  }

  matches(simulationResult: SimulationResult): boolean {
    const pbpIndex = simulationResult.steps.findIndex(step => step.action.is(PieceByPiece));
    const synthIndex = simulationResult.steps.findIndex(step => step.addedProgression > 0);
    return pbpIndex > synthIndex;
  }

}
