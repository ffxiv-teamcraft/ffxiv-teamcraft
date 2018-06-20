import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class BrandOfWind extends BrandAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.CRP, level: 37};
    }

    getBuffedBy(): Buff {
        return Buff.NAME_OF_THE_WIND;
    }

    getIds(): number[] {
        return [100006];
    }
}
