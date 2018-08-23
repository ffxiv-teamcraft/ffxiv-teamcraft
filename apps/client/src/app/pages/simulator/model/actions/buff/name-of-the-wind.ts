import { NameOfBuff } from './name-of-buff';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';

export class NameOfTheWind extends NameOfBuff {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.CRP, level: 54 };
  }

  getIds(): number[] {
    return [4568];
  }

  protected getBuff(): Buff {
    return Buff.NAME_OF_THE_WIND;
  }
}
