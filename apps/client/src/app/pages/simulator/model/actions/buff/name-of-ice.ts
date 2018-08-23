import { NameOfBuff } from './name-of-buff';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class NameOfIce extends NameOfBuff {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ARM, level: 54 };
  }

  getIds(): number[] {
    return [4570];
  }

  protected getBuff(): Buff {
    return Buff.NAME_OF_ICE;
  }
}
