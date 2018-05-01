import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';

export class BrandOfWater extends BrandAction {

    getBuffedBy(): Buff {
        return Buff.NAME_OF_WATER;
    }

    getIds(): number[] {
        return [100095];
    }
}
