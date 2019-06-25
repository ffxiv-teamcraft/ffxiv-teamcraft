import { RotationTip } from '../rotation-tip';
import {
  ByregotsBlessing,
  ByregotsBrow,
  ByregotsMiracle,
  Ingenuity,
  IngenuityII,
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
      || this.simulationHasAction(simulationResult, ByregotsBrow)
      || this.simulationHasAction(simulationResult, ByregotsMiracle))
      && (this.simulationHasAction(simulationResult, Ingenuity) || this.simulationHasAction(simulationResult, IngenuityII));
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    const clvl = Tables.LEVEL_TABLE[simulation.crafterStats.level] || simulation.crafterStats.level;
    const byregotsIndex = simulation.actions.findIndex(a => a.is(ByregotsBrow) || a.is(ByregotsBlessing) || a.is(ByregotsMiracle));
    return simulation.actions.slice(byregotsIndex).some(a => a.is(Ingenuity) || a.is(Ingenuity))
      && simulationResult.hqPercent < 100
      && clvl < simulation.recipe.rlvl;
  }

}
