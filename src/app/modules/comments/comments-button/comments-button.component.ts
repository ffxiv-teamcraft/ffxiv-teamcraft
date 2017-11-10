import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {CommentsPopupComponent} from '../comments-popup/comments-popup.component';
import {ListRow} from '../../../model/list/list-row';
import {ListService} from '../../../core/firebase/list.service';
import {List} from '../../../model/list/list';

@Component({
    selector: 'app-comments-button',
    templateUrl: './comments-button.component.html',
    styleUrls: ['./comments-button.component.scss']
})
export class CommentsButtonComponent implements OnInit {

    @Input()
    row: ListRow;

    @Input()
    list: List;

    @Input()
    name: string;

    @Input()
    isOwnList = false;

    amount: number;

    constructor(private dialog: MatDialog) {
    }

    openPopup(): void {
        this.dialog.open(CommentsPopupComponent, {data: {name: this.name, row: this.row, list: this.list, isOwnList: this.isOwnList}});
    }

    ngOnInit(): void {
        this.amount = this.row.comments === undefined ? 0 : this.row.comments.length;
    }

}
