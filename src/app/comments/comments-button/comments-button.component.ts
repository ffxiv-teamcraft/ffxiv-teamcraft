import {Component, Input} from '@angular/core';
import {MdDialog} from '@angular/material';
import {CommentsPopupComponent} from '../comments-popup/comments-popup.component';

@Component({
    selector: 'app-comments-button',
    templateUrl: './comments-button.component.html',
    styleUrls: ['./comments-button.component.scss']
})
export class CommentsButtonComponent {

    @Input()
    uri: string;

    @Input()
    name: string;

    constructor(private dialog: MdDialog) {
    }

    openPopup(): void {
        this.dialog.open(CommentsPopupComponent, {data: {name: this.name, resourceUri: this.uri}});
    }

}
