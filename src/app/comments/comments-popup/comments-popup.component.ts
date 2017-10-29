import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {CommentsService} from '../comments.service';
import {ResourceComment} from '../resource-comment';
import {MD_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../core/user.service';

@Component({
    selector: 'app-comments-popup',
    templateUrl: './comments-popup.component.html',
    styleUrls: ['./comments-popup.component.scss']
})
export class CommentsPopupComponent implements OnInit {

    comments: ResourceComment[];

    control: FormGroup = new FormGroup({comment: new FormControl('', [Validators.required, Validators.maxLength(140)])});

    userId: number;

    @ViewChild('f') myNgForm;

    constructor(private commentsService: CommentsService,
                @Inject(MD_DIALOG_DATA) public data: { resourceUri: string, name: string, isOwnList: boolean },
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
        this.commentsService.push(comment, this.data.resourceUri).then(() => {
            this.control.reset();
            this.myNgForm.resetForm();
        });
    }

    deleteComment(key: string): void {
        this.commentsService.remove(key, this.data.resourceUri);
    }

    ngOnInit() {
        this.commentsService.getAll(this.data.resourceUri).subscribe(comments => this.comments = comments);
    }

}
