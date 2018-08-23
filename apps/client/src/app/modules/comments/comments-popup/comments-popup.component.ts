import { Component, Inject, ViewChild } from '@angular/core';
import { ResourceComment } from '../resource-comment';
import { MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/database/user.service';
import { ListRow } from '../../../model/list/list-row';
import { ListService } from '../../../core/database/list.service';
import { first } from 'rxjs/operators';
import { NotificationService } from '../../../core/notification/notification.service';
import { ListCommentNotification } from '../../../model/notification/list-comment-notification';
import { List } from '../../../model/list/list';

@Component({
  selector: 'app-comments-popup',
  templateUrl: './comments-popup.component.html',
  styleUrls: ['./comments-popup.component.scss']
})
export class CommentsPopupComponent {

  control: FormGroup = new FormGroup({ comment: new FormControl('', [Validators.required, Validators.maxLength(140)]) });

  characterId: number;

  userId: string;

  @ViewChild('f') myNgForm;

  private readonly isListComment: boolean;

  private userName: string;

  constructor(private service: ListService,
              @Inject(MAT_DIALOG_DATA) public data: { row: ListRow, list: List, name: string, isOwnList: boolean },
              private userService: UserService, private notificationService: NotificationService) {
    this.isListComment = this.data.row === undefined;
    // this.userService.getCharacter().subscribe(character => {
    //     this.userName = character.name;
    //     this.userId = character.user.$key;
    //     if (character.name === 'Anonymous') {
    //         this.characterId = -1;
    //     } else {
    //         this.characterId = +character.user.lodestoneId;
    //     }
    // });
  }

  public get comments(): ResourceComment[] {
    return (this.isListComment ? this.data.list.comments : this.data.row.comments) || [];
  }

  public set comments(comments: ResourceComment[]) {
    if (this.isListComment) {
      this.data.list.comments = comments;
    } else {
      this.data.row.comments = comments;
    }
  }

  addComment(): void {
    const comment: ResourceComment = new ResourceComment();
    comment.date = new Date().toISOString();
    comment.content = this.control.value.comment;
    comment.authorId = this.characterId;
    const comments = this.comments;
    comments.push(comment);
    this.comments = comments;
    if (this.isListComment && this.userId !== this.data.list.authorId) {
      // If this is a comment on a list, notify the author of the list.
      const notification = new ListCommentNotification(this.userName, comment.content, this.data.list.name);
      this.notificationService.add(this.notificationService.prepareNotification(this.data.list.authorId, notification));
    }
    this.service.set(this.data.list.$key, this.data.list).pipe(first()).subscribe(() => {
      this.control.reset();
      this.myNgForm.resetForm();
    });
  }

  deleteComment(comment: ResourceComment): void {
    this.comments = this.comments.filter(row => {
      return row.authorId !== comment.authorId || row.date !== comment.date || row.content !== comment.content;
    });
    this.service.set(this.data.list.$key, this.data.list);
  }

}
