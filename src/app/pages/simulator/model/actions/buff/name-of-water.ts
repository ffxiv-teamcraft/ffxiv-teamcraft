import {NameOfBuff} from './name-of-buff';
import {Buff} from '../../buff.enum';

export class NameOfWater extends NameOfBuff {

    protected getBuff(): Buff {
        return Buff.NAME_OF_WATER;
    }

    getIds(): number[] {
        return [4573];
    }
}
