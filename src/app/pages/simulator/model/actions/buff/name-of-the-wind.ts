import {NameOfBuff} from './name-of-buff';
import {Buff} from '../../buff.enum';

export class NameOfTheWind extends NameOfBuff {

    protected getBuff(): Buff {
        return Buff.NAME_OF_THE_WIND;
    }

    getIds(): number[] {
        return [4568];
    }
}
