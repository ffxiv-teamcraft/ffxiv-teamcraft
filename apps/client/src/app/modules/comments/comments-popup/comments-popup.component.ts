import { Component, OnInit } from '@angular/core';
import { CommentTargetType } from '../comment-target-type';
import { CommentsService } from '../comments.service';
import { ResourceComment } from '../resource-comment';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { shareReplay } from 'rxjs/operators';
import { AbstractNotification } from '../../../core/notification/abstract-notification';
import { NotificationService } from '../../../core/notification/notification.service';

@Component({
  selector: 'app-comments-popup',
  templateUrl: './comments-popup.component.html',
  styleUrls: ['./comments-popup.component.less']
})
export class CommentsPopupComponent implements OnInit {

  targetType: CommentTargetType;

  targetId: string;

  targetDetails = 'none';

  newCommentContent: string;

  comments$: Observable<ResourceComment[]>;

  isAuthor: boolean;

  notificationFactory: (comment: ResourceComment) => AbstractNotification;

  userId$ = this.authFacade.userId$.pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor(private commentsService: CommentsService, private authFacade: AuthFacade,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.comments$ = this.commentsService.getComments(this.targetType, this.targetId, this.targetDetails);
  }

  deleteComment(key: string): void {
    this.commentsService.remove(key).subscribe();
  }

  postComment(message: string, userId: string): void {
    if (message && message.length > 0) {
      const comment = new ResourceComment();
      comment.authorId = userId;
      comment.date = new Date().toUTCString();
      comment.content = message;
      comment.targetType = this.targetType;
      comment.targetId = this.targetId;
      comment.targetDetails = this.targetDetails;
      this.commentsService.add(comment).subscribe();
      delete this.newCommentContent;
      if (!this.isAuthor && this.notificationFactory !== undefined) {
        const notification = this.notificationFactory(comment);
        this.notificationService.add(notification);
      }
    }
  }

}
