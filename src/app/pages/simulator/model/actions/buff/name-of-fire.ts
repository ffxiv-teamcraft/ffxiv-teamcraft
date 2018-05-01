import {NameOfBuff} from './name-of-buff';
import {Buff} from '../../buff.enum';

export class NameOfFire extends NameOfBuff {

    protected getBuff(): Buff {
        return Buff.NAME_OF_FIRE;
    }

    getIds(): number[] {
        return [4569];
    }
}
