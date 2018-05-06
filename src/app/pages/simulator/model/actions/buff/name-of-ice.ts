import {NameOfBuff} from './name-of-buff';
import {Buff} from '../../buff.enum';

export class NameOfIce extends NameOfBuff {

    protected getBuff(): Buff {
        return Buff.NAME_OF_ICE;
    }

    getIds(): number[] {
        return [4570];
    }
}
