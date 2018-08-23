import { NameOfBuff } from './name-of-buff';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class NameOfWater extends NameOfBuff {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ALC, level: 54 };
  }

  getIds(): number[] {
    return [4573];
  }

  protected getBuff(): Buff {
    return Buff.NAME_OF_WATER;
  }
}
