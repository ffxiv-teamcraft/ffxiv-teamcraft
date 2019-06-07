import { RotationTip } from '../rotation-tip';
import { SimulationResult } from '../../simulation/simulation-result';
import { IngenuityII } from '../../model/actions/buff/ingenuity-ii';
import { Ingenuity } from '../../model/actions/buff/ingenuity';
import { RotationTipType } from '../rotation-tip-type';
import { ByregotsBlessing } from '../../model/actions/quality/byregots-blessing';
import { ByregotsBrow } from '../../model/actions/quality/byregots-brow';
import { ByregotsMiracle } from '../../model/actions/quality/byregots-miracle';

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
    const byregotsIndex = simulation.actions.findIndex(a => a.is(ByregotsBrow) || a.is(ByregotsBlessing) || a.is(ByregotsMiracle));
    return simulation.actions.slice(byregotsIndex).some(a => a.is(Ingenuity) || a.is(Ingenuity));
  }

}
