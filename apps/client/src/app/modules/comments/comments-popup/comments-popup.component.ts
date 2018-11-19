import { Component, OnInit } from '@angular/core';
import { CommentTargetType } from '../comment-target-type';
import { CommentsService } from '../comments.service';
import { ResourceComment } from '../resource-comment';
import { Observable } from 'rxjs/Observable';
import { AuthFacade } from '../../../+state/auth.facade';
import { shareReplay } from 'rxjs/operators';

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

  userId$ = this.authFacade.userId$.pipe(shareReplay(1));

  constructor(private commentsService: CommentsService, private authFacade: AuthFacade) {
  }

  ngOnInit() {
    this.comments$ = this.commentsService.getComments(this.targetType, this.targetId, this.targetDetails);
  }

  deleteComment(key: string): void {
    this.commentsService.remove(key).subscribe();
  }

  postComment(message: string, userId: string): void {
    const comment = new ResourceComment();
    comment.authorId = userId;
    comment.date = Date.now().toLocaleString();
    comment.content = message;
    comment.targetType = this.targetType;
    comment.targetId = this.targetId;
    comment.targetDetails = this.targetDetails;
    this.commentsService.add(comment).subscribe();
  }

}
