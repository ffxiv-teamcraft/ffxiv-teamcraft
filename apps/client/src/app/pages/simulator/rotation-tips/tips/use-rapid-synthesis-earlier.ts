import { RotationTip } from '../rotation-tip';
import { SimulationResult } from '../../simulation/simulation-result';
import { RotationTipType } from '../rotation-tip-type';
import { RapidSynthesis } from '../../model/actions/progression/rapid-synthesis';
import { RapidSynthesisII } from '../../model/actions/progression/rapid-synthesis-ii';

export class UseRapidSynthesisEarlier extends RotationTip {
  constructor() {
    super(RotationTipType.WARNING, 'Use_rapid_synthesis_earlier');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, RapidSynthesis) || this.simulationHasAction(simulationResult, RapidSynthesisII);
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    const finisher = simulation.actions[simulation.actions.length - 1];
    return finisher.is(RapidSynthesis) || finisher.is(RapidSynthesisII);
  }

}
