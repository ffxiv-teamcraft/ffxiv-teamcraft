import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {List} from '../../../model/list/list';
import {ListRow} from '../../../model/list/list-row';

@Component({
    selector: 'app-requirements-popup',
    templateUrl: './requirements-popup.component.html',
    styleUrls: ['./requirements-popup.component.scss']
})
export class RequirementsPopupComponent {

    constructor(@Inject(MD_DIALOG_DATA)public data: { item: ListRow, list: List }) {
        if (this.data.item.requires !== undefined) {
            this.data.item.requires = data.item.requires.sort((a, b) => a.id - b.id);
        }
    }

    public getRequirementDetails(row: ListRow): ListRow {
        return this.data.list.getItemById(row.id);
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
