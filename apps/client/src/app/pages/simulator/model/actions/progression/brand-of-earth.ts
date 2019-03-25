import { BrandAction } from './brand-action';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';
import { RecipeElement } from '../../../../../model/garland-tools/recipe-element';

export class BrandOfEarth extends BrandAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.LTW, level: 37 };
  }

  getBuffedBy(): Buff {
    return Buff.NAME_OF_EARTH;
  }

  getIds(): number[] {
    return [100050];
  }

  getElement(): RecipeElement {
    return RecipeElement.EARTH;
  }
}
