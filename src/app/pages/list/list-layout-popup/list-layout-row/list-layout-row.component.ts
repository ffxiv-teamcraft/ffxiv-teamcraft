import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LayoutRow} from '../../../../core/layout/layout-row';
import {LayoutRowFilter} from '../../../../core/layout/layout-row-filter';

@Component({
    selector: 'app-list-layout-row',
    templateUrl: './list-layout-row.component.html',
    styleUrls: ['./list-layout-row.component.scss']
})
export class ListLayoutRowComponent implements OnInit {

    @Input()
    row: LayoutRow;

    @Output()
    rowChange: EventEmitter<LayoutRow> = new EventEmitter<LayoutRow>();

    @Input()
    readonly = false;

    @Input()
    first: boolean;

    @Input()
    last: boolean;

    @Output()
    delete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    up: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    down: EventEmitter<void> = new EventEmitter<void>();

    public filter: { isBooleanGate: boolean, reversed: boolean, value: string }[] = [];

    constructor() {
    }

    rowChanged(): void {
        this.rowChange.emit(this.row);
    }

    filterChange(): void {
        this.row.filterName = this.filterToName();
        this.rowChange.emit(this.row);
    }

    private filterToName(): string {
        return this.filter.map(fragment => `${fragment.reversed ? '!' : ''}${fragment.value}`).join(':');
    }

    public getAllFilters(): string[] {
        return LayoutRowFilter.ALL_NAMES;
    }

    public addFragment(): void {
        this.filter.push({isBooleanGate: true, reversed: false, value: 'or'}, {isBooleanGate: false, reversed: false, value: 'NONE'});
    }

    public removeFragment(): void {
        if (this.filter.length > 1) {
            this.filter.splice(-2, 2);
        }
        this.filterChange();
    }

    ngOnInit(): void {
        this.filter = this.row.filterName.split(':').map(fragment => {
            const result = {
                isBooleanGate: fragment === 'or' || fragment === 'and',
                value: fragment,
                reversed: fragment.charAt(0) === '!'
            };
            if (result.reversed) {
                result.value = result.value.substr(1);
            }
            return result;
        });
    }

}
