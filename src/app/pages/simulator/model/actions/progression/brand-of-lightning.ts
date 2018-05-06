import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';

export class BrandOfLightning extends BrandAction {

    getBuffedBy(): Buff {
        return Buff.NAME_OF_LIGHTNING;
    }

    getIds(): number[] {
        return [100066];
    }
}
