import { RotationTip } from '../rotation-tip';
import { RapidSynthesis, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class UseRapidSynthesisEarlier extends RotationTip {
  constructor() {
    super(RotationTipType.WARNING, 'Use_rapid_synthesis_earlier');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, RapidSynthesis);
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    const finisher = simulation.actions[simulation.actions.length - 1];
    return finisher.is(RapidSynthesis);
  }

}
