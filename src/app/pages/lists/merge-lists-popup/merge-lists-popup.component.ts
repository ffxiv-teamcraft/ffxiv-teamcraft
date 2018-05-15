import {Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSelectionList} from '@angular/material';
import {List} from '../../../model/list/list';
import {ListService} from '../../../core/database/list.service';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-merge-lists-popup',
    templateUrl: './merge-lists-popup.component.html',
    styleUrls: ['./merge-lists-popup.component.scss']
})
export class MergeListsPopupComponent {

    @ViewChild('selectedLists') selectionList: MatSelectionList;

    listName = '';

    constructor(@Inject(MAT_DIALOG_DATA) public data: { lists: List[], authorId: string }, private listService: ListService,
                private dialogRef: MatDialogRef<MergeListsPopupComponent>) {
    }

    /**
     * Creates a new empty list to merge it with all the lists selected.
     */
    merge(): void {
        const resultList = new List();
        resultList.name = this.listName;
        resultList.authorId = this.data.authorId;
        this.selectionList.selectedOptions.selected.forEach(option => {
            resultList.merge(option.value);
        });
        this.listService.add(resultList).pipe(first()).subscribe(() => {
            this.dialogRef.close();
        });
    }

}
