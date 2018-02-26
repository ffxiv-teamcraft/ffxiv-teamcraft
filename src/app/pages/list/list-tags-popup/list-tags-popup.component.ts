import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {List} from '../../../model/list/list';
import {ListTag} from '../../../model/list/list-tag.enum';

@Component({
    selector: 'app-list-tags-popup',
    templateUrl: './list-tags-popup.component.html',
    styleUrls: ['./list-tags-popup.component.scss']
})
export class ListTagsPopupComponent {

    public tags: ListTag[];

    public possibleTags = Object.keys(ListTag);

    constructor(@Inject(MAT_DIALOG_DATA) public list: List) {
        this.tags = list.tags || [];
    }

    public setTag(tag: ListTag, selected: boolean): void {
        if (selected) {
            this.tags.push(ListTag[tag]);
        } else {
            this.tags = this.tags.filter(t => t !== ListTag[tag]);
        }
    }

    public isChecked(tag: string) {
        return this.tags.map(t => t.toUpperCase()).indexOf(tag.toUpperCase()) > -1;
    }
}
