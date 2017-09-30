import {Component, EventEmitter, Input, Output} from '@angular/core';
import {List} from '../../model/list/list';

@Component({
    selector: 'app-list-row',
    templateUrl: './list-row.component.html',
    styleUrls: ['./list-row.component.scss']
})
export class ListRowComponent {

    @Input()
    public list: List;

    @Input()
    public expanded: boolean;

    @Input()
    public authorUid: number;

    @Output()
    opened: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    ondelete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    onedit: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    public readonly = false;

    constructor() {
    }
}
