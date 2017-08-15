import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ListRow} from '../model/list-row';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent {

    @Input()
    item: ListRow;

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

    public setDone(row: ListRow, amount: number) {
        this.done.emit({row: row, amount: amount});
    }
}
