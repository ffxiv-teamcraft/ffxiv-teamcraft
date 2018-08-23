import { GeneralAction } from '../general-action';
import { Simulation } from '../../../simulation/simulation';
import { ActionType } from '../action-type';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class TrainedHand extends GeneralAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ANY, level: 59 };
  }

  _canBeUsed(simulation: Simulation, linear?: boolean): boolean {
    return simulation.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK) && simulation.hasBuff(Buff.INNER_QUIET) &&
      simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks === simulation.getBuff(Buff.INNER_QUIET).stacks;
  }

  execute(simulation: Simulation): void {
    const baseQualityIncrease = this.getBaseQuality(simulation);
    const baseProgressIncrease = this.getBaseProgression(simulation);
    const qualityPotency = this.getPotency(simulation);
    // Progress
    let progressPotency = this.getPotency(simulation);
    if (simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks % 3 === 0) {
      progressPotency += 50;
    }
    simulation.progression += Math.floor(baseProgressIncrease * progressPotency / 100);

    // Quality
    if (simulation.getBuff(Buff.INNER_QUIET).stacks < 11) {
      simulation.getBuff(Buff.INNER_QUIET).stacks++;
    }
    let qualityIncrease = this.getBaseQuality(simulation) * this.getPotency(simulation) / 100;
    switch (simulation.state) {
      case 'EXCELLENT':
        qualityIncrease *= 4;
        break;
      case 'POOR':
        qualityIncrease *= 0.5;
        break;
      case 'GOOD':
        qualityIncrease *= 1.5;
        break;
      default:
        break;
    }
    if (simulation.hasBuff(Buff.GREAT_STRIDES)) {
      qualityIncrease *= 2;
      simulation.removeBuff(Buff.GREAT_STRIDES);
    }
    simulation.quality += Math.ceil(qualityIncrease);
    if (simulation.hasBuff(Buff.INNER_QUIET) && simulation.getBuff(Buff.INNER_QUIET).stacks < 11) {
      simulation.getBuff(Buff.INNER_QUIET).stacks++;
    }
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 32;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 80;
  }

  getIds(): number[] {
    return [100161, 100162, 100163, 100164, 100165, 100166, 100167, 100168];
  }

  // Potency is the same for both quality and progression so let's use this.
  getPotency(simulation: Simulation): number {
    return 150;
  }

  getType(): ActionType {
    return ActionType.OTHER;
  }

}
