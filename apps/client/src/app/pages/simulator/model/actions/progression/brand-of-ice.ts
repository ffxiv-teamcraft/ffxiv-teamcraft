import { BrandAction } from './brand-action';
import { Buff } from '../../buff.enum';
import { CraftingJob } from '../../crafting-job.enum';
import { RecipeElement } from '../../../../../model/garland-tools/recipe-element';

export class BrandOfIce extends BrandAction {

  getLevelRequirement(): { job: CraftingJob; level: number } {
    return { job: CraftingJob.ARM, level: 37 };
  }

  getBuffedBy(): Buff {
    return Buff.NAME_OF_ICE;
  }

  getIds(): number[] {
    return [100036];
  }

  getElement(): RecipeElement {
    return RecipeElement.ICE;
  }
}
