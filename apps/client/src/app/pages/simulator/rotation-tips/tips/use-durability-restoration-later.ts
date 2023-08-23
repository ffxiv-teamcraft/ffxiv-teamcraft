import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Manipulation, MastersMend, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseDurabilityRestorationLater extends RotationTip {

  private matchingIndex: number;

  constructor() {
    super(RotationTipType.INFO, 'Use_durability_restoration_later');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, MastersMend)
      || this.simulationHasAction(simulationResult, Manipulation);
  }

  messageParams(simulationResult: SimulationResult): any {
    return { index: this.matchingIndex };
  }

  matches(simulationResult: SimulationResult): boolean {
    const mastersMendIIIndexes = this.getAllActionIndexes(simulationResult, MastersMend);
    const manipulationIIIndexes = this.getAllActionIndexes(simulationResult, Manipulation);

    const usedMastersMendTooEarly = mastersMendIIIndexes.some((index) => {
      const clone = simulationResult.simulation.clone();
      clone.run(true, index);
      const matches = clone.recipe.durability - clone.durability < 30;
      if (matches) {
        this.matchingIndex = index + 1;
      }
      return matches;
    });

    const usedManipulationTooEarly = manipulationIIIndexes.some((index) => {
      // Get all steps after Manipulation, then remove any skipsBuffTicks() steps, then get the first Manipulation.getDuration() steps.
      const repairSteps = simulationResult.steps.slice(index + 1, simulationResult.steps.length).filter(s => !s.action.skipsBuffTicks()).slice(0, new Manipulation().getDuration(simulationResult.simulation));
      const matches = repairSteps.some(step => {
        return step.afterBuffTick.solidityDifference === 0 && step.solidityDifference === 0;
      });
      if (matches) {
        this.matchingIndex = index + 1;
      }
      return matches;
    });

    return usedMastersMendTooEarly || usedManipulationTooEarly;
  }
}
