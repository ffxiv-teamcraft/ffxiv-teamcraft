import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {List} from '../../../model/list/list';
import {Workshop} from '../../../model/other/workshop';

@Component({
    selector: 'app-lists-selection-popup',
    templateUrl: './lists-selection-popup.component.html',
    styleUrls: ['./lists-selection-popup.component.scss']
})
export class ListsSelectionPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: { workshop: Workshop, lists: List[] }) {
    }

}
