import { RotationTip } from '../rotation-tip';
import {
  ByregotsBlessing,
  ByregotsMiracle,
  Ingenuity,
  SimulationResult,
  Tables
} from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class UseIngenuityBeforeByregot extends RotationTip {
  constructor() {
    super(RotationTipType.WARNING, 'Use_ingenuity_before_byregot');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return (this.simulationHasAction(simulationResult, ByregotsBlessing)
      || this.simulationHasAction(simulationResult, ByregotsMiracle))
      && (this.simulationHasAction(simulationResult, Ingenuity));
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    const clvl = Tables.LEVEL_TABLE[simulation.crafterStats.level] || simulation.crafterStats.level;
    const byregotsIndex = simulation.actions.findIndex(a => a.is(ByregotsBlessing) || a.is(ByregotsMiracle));
    return !simulation.actions
        .slice(byregotsIndex - 5, byregotsIndex)
        .some(a => a.is(Ingenuity) || a.is(Ingenuity))
      && simulation.actions
        .slice(byregotsIndex)
        .some(a => a.is(Ingenuity) || a.is(Ingenuity))
      && simulationResult.hqPercent < 100
      && clvl < simulation.recipe.rlvl;
  }

}
