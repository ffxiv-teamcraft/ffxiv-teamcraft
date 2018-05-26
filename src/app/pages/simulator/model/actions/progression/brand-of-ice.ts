import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class BrandOfIce extends BrandAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ARM, level: 37};
    }

    getBuffedBy(): Buff {
        return Buff.NAME_OF_ICE;
    }

    getIds(): number[] {
        return [100036];
    }
}
