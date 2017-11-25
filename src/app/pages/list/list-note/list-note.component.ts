import {Component, Input} from '@angular/core';
import {List} from '../../../model/list/list';
import {ListService} from '../../../core/database/list.service';

@Component({
    selector: 'app-list-note',
    templateUrl: './list-note.component.html',
    styleUrls: ['./list-note.component.scss']
})
export class ListNoteComponent {

    @Input()
    list: List;

    @Input()
    readonly = true;

    editNote = false;

    constructor(private listService: ListService) {
    }

    public save(): void {
        if (this.list.note.length <= 1000) {
            this.editNote = false;
            this.listService.update(this.list.$key, this.list).subscribe(() => {
            });
        }
    }
}
