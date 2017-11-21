import {ListRow} from '../../model/list/list-row';

export function trackByItem(index: number, item: ListRow) {
    return item.done;
}
