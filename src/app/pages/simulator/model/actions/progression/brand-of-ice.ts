import {BrandAction} from './brand-action';
import {Buff} from '../../buff.enum';

export class BrandOfIce extends BrandAction {

    getBuffedBy(): Buff {
        return Buff.NAME_OF_ICE;
    }

    getIds(): number[] {
        return [100036];
    }
}
