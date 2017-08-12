import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ListRow} from '../model/list-row';

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

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.item = this.http.get(`https://api.xivdb.com/item/${this.row.id}`).subscribe(item => this.item = item);
    }

}
