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
      const repairSteps = simulationResult.steps.slice(index + 1, index + 1 + new Manipulation().getDuration(simulationResult.simulation));
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
