import {Component, Inject, ViewChild} from '@angular/core';
import {ResourceComment} from '../resource-comment';
import {MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../core/database/user.service';
import {ListRow} from '../../../model/list/list-row';
import {ListService} from '../../../core/database/list.service';
import {List} from 'app/model/list/list';

@Component({
    selector: 'app-comments-popup',
    templateUrl: './comments-popup.component.html',
    styleUrls: ['./comments-popup.component.scss']
})
export class CommentsPopupComponent {

    control: FormGroup = new FormGroup({comment: new FormControl('', [Validators.required, Validators.maxLength(140)])});

    userId: number;

    @ViewChild('f') myNgForm;

    constructor(private service: ListService,
                @Inject(MAT_DIALOG_DATA) public data: { row: ListRow, list: List, name: string, isOwnList: boolean },
                private userService: UserService) {
        this.userService.getUserData().subscribe(user => {
            if (user.name === 'Anonymous') {
                this.userId = -1;
            } else {
                this.userId = +user.lodestoneId;
            }
        });
    }

    addComment(): void {
        const comment: ResourceComment = new ResourceComment();
        comment.date = new Date().toISOString();
        comment.content = this.control.value.comment;
        comment.authorId = this.userId;
        this.comments.push(comment);
        this.service.update(this.data.list.$key, this.data.list).first().subscribe(() => {
            this.control.reset();
            this.myNgForm.resetForm();
        });
    }

    deleteComment(comment: ResourceComment): void {
        this.comments = this.comments.filter(row => {
            return row.authorId !== comment.authorId || row.date !== comment.date || row.content !== comment.content;
        });
        this.service.update(this.data.list.$key, this.data.list);
    }

    private get comments(): ResourceComment[] {
        return (this.data.row === undefined ? this.data.list.comments : this.data.row.comments) || [];
    }

    private set comments(comments: ResourceComment[]) {
        if (this.data.row === undefined) {
            this.data.list.comments = comments
        } else {
            this.data.row.comments = comments;
        }
    }

}
