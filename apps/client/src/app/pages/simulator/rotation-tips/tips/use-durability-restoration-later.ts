import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Manipulation, ManipulationII, MastersMend, MastersMendII, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseDurabilityRestorationLater extends RotationTip {

  private matchingIndex: number;

  constructor() {
    super(RotationTipType.INFO, 'Use_durability_restoration_later');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, MastersMend)
      || this.simulationHasAction(simulationResult, MastersMendII)
      || this.simulationHasAction(simulationResult, Manipulation)
      || this.simulationHasAction(simulationResult, ManipulationII);
  }

  messageParams(simulationResult: SimulationResult): any {
    return { index: this.matchingIndex };
  }

  matches(simulationResult: SimulationResult): boolean {
    const mastersMendIndexes = this.getAllActionIndexes(simulationResult, MastersMend);
    const mastersMendIIIndexes = this.getAllActionIndexes(simulationResult, MastersMendII);
    const manipulationIndexes = this.getAllActionIndexes(simulationResult, Manipulation);
    const manipulationIIIndexes = this.getAllActionIndexes(simulationResult, ManipulationII);

    const usedMastersMendTooEarly = mastersMendIndexes.some((index) => {
      const clone = simulationResult.simulation.clone();
      clone.run(true, index);
      const matches = clone.recipe.durability - clone.durability < 30;
      if (matches) {
        this.matchingIndex = index + 1;
      }
      return matches;
    });

    const usedMastersMendIITooEarly = mastersMendIIIndexes.some((index) => {
      const clone = simulationResult.simulation.clone();
      clone.run(true, index);
      const matches = clone.recipe.durability - clone.durability < 60;
      if (matches) {
        this.matchingIndex = index + 1;
      }
      return matches;
    });

    const usedManipulationTooEarly = manipulationIndexes.some((index) => {
      const repairSteps = simulationResult.steps.slice(index + 1, index + 1 + new Manipulation().getDuration(simulationResult.simulation));
      const matches = repairSteps.some(step => {
        return step.afterBuffTick.solidityDifference === 0 && step.solidityDifference === 0;
      });
      if (matches) {
        this.matchingIndex = index + 1;
      }
      return matches;
    });

    const usedManipulationIITooEarly = manipulationIIIndexes.some((index) => {
      const repairSteps = simulationResult.steps.slice(index + 1, index + 1 + new ManipulationII().getDuration(simulationResult.simulation));
      const matches = repairSteps.some(step => {
        return step.afterBuffTick.solidityDifference === 0 && step.solidityDifference === 0;
      });
      if (matches) {
        this.matchingIndex = index + 1;
      }
      return matches;
    });

    return usedMastersMendTooEarly || usedMastersMendIITooEarly || usedManipulationTooEarly || usedManipulationIITooEarly;
  }
}
