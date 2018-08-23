import { NameOfBuff } from './name-of-buff';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class NameOfEarth extends NameOfBuff {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.LTW, level: 54 };
  }

  getIds(): number[] {
    return [4571];
  }

  protected getBuff(): Buff {
    return Buff.NAME_OF_EARTH;
  }
}
