import {NameOfBuff} from './name-of-buff';
import {Buff} from '../../buff.enum';

export class NameOfLightning extends NameOfBuff {

    protected getBuff(): Buff {
        return Buff.NAME_OF_LIGHTNING;
    }

    getIds(): number[] {
        return [4572];
    }
}
