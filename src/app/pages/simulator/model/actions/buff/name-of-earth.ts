import {NameOfBuff} from './name-of-buff';
import {Buff} from '../../buff.enum';

export class NameOfEarth extends NameOfBuff {

    protected getBuff(): Buff {
        return Buff.NAME_OF_EARTH;
    }

    getIds(): number[] {
        return [4571];
    }
}
