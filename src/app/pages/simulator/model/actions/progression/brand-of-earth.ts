import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';

export class BrandOfEarth extends BrandAction {

    getBuffedBy(): Buff {
        return Buff.NAME_OF_EARTH;
    }

    getIds(): number[] {
        return [100050];
    }
}
