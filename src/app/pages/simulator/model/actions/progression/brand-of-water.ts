import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class BrandOfWater extends BrandAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ALC, level: 37};
    }

    getBuffedBy(): Buff {
        return Buff.NAME_OF_WATER;
    }

    getIds(): number[] {
        return [100095];
    }
}
