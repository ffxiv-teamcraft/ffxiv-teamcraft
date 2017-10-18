import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {ListRow} from '../../../model/list/list-row';
import {List} from '../../../model/list/list';

@Component({
    selector: 'app-required-by-popup',
    templateUrl: './required-by-popup.component.html',
    styleUrls: ['./required-by-popup.component.scss']
})
export class RequiredByPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA) public data: { item: ListRow, list: List }) {
    }

    public getRequiredBy(): ListRow[] {
        const requiredBy = [];
        this.data.list.forEach(item => {
            if (item.requires !== undefined) {
                item.requires.forEach(requirement => {
                    if (requirement.id === this.data.item.id) {
                        requiredBy.push(item);
                    }
                });
            }
        });
        return requiredBy;
    }

}
