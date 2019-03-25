import { BrandAction } from './brand-action';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';
import { RecipeElement } from '../../../../../model/garland-tools/recipe-element';

export class BrandOfFire extends BrandAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.BSM, level: 37 };
  }

  getBuffedBy(): Buff {
    return Buff.NAME_OF_FIRE;
  }

  getIds(): number[] {
    return [100020];
  }

  getElement(): RecipeElement {
    return RecipeElement.FIRE;
  }
}
