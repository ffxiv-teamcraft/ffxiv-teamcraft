import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';

export class BrandOfWind extends BrandAction {

    getBuffedBy(): Buff {
        return Buff.NAME_OF_THE_WIND;
    }

    getIds(): number[] {
        return [100006];
    }
}
