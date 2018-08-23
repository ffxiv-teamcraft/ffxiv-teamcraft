import { NameOfBuff } from './name-of-buff';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class NameOfFire extends NameOfBuff {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.BSM, level: 54 };
  }

  getIds(): number[] {
    return [4569];
  }

  protected getBuff(): Buff {
    return Buff.NAME_OF_FIRE;
  }
}
