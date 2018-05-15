import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';

export class BrandOfFire extends BrandAction {

    getBuffedBy(): Buff {
        return Buff.NAME_OF_FIRE;
    }

    getIds(): number[] {
        return [100020];
    }
}
