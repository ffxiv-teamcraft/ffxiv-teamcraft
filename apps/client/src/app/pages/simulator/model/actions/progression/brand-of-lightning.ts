import { BrandAction } from './brand-action';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';
import { RecipeElement } from '../../../../../model/garland-tools/recipe-element';

export class BrandOfLightning extends BrandAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.WVR, level: 37 };
  }

  getBuffedBy(): Buff {
    return Buff.NAME_OF_LIGHTNING;
  }

  getIds(): number[] {
    return [100066];
  }

  getElement(): RecipeElement {
    return RecipeElement.LIGHTNING;
  }
}
