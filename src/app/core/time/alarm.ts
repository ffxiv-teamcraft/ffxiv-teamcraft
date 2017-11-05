import {ListRow} from '../../model/list/list-row';

export interface Alarm {
    item: ListRow;
    spawn: number;
    duration: number;
}
