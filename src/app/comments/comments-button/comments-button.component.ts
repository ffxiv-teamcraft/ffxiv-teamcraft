import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {CommentsPopupComponent} from '../comments-popup/comments-popup.component';
import {CommentsService} from '../comments.service';

@Component({
    selector: 'app-comments-button',
    templateUrl: './comments-button.component.html',
    styleUrls: ['./comments-button.component.scss']
})
export class CommentsButtonComponent implements OnInit {

    @Input()
    uri: string;

    @Input()
    name: string;

    @Input()
    isOwnList = false;

    amount: number;

    constructor(private dialog: MatDialog, private commentsService: CommentsService) {
    }

    openPopup(): void {
        this.dialog.open(CommentsPopupComponent, {data: {name: this.name, resourceUri: this.uri, isOwnList: this.isOwnList}});
    }

    ngOnInit(): void {
        this.commentsService.getAll(this.uri).subscribe(comments => this.amount = comments.length);
    }

}
