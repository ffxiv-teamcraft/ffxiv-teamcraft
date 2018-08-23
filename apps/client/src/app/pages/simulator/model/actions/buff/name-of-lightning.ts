import { NameOfBuff } from './name-of-buff';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class NameOfLightning extends NameOfBuff {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.WVR, level: 54 };
  }

  getIds(): number[] {
    return [4572];
  }

  protected getBuff(): Buff {
    return Buff.NAME_OF_LIGHTNING;
  }
}
