import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {List} from '../../model/list/list';

@Component({
    selector: 'app-list-details-panel',
    templateUrl: './list-details-panel.component.html',
    styleUrls: ['./list-details-panel.component.scss']
})
export class ListDetailsPanelComponent {

    @Input()
    title: string;

    @Input()
    data: ListRow[];

    @Input()
    list: List;

    @Input()
    showRequirements = false;

    @Input()
    recipe = false;

    @Output()
    done: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

}
