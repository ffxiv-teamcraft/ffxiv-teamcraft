import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ListRow} from '../model/list-row';
import {XivdbService} from '../core/xivdb.service';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

    @Input()
    row: ListRow;

    item: any;

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

    public setDone(row: ListRow, amount: number) {
        this.done.emit({row: row, amount: amount});
    }

    constructor(private xivdb: XivdbService) {
    }

    ngOnInit() {
        this.item = this.xivdb.getItem(this.row.id)
            .subscribe(item => this.item = item);
    }

}
