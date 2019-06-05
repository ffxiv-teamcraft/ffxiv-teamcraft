import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { DbCommentsService } from '../db-comments.service';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { DbComment } from '../model/db-comment';
import { Observable } from 'rxjs';
import { first, takeUntil, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../../+state/auth.facade';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-db-comments',
  templateUrl: './db-comments.component.html',
  styleUrls: ['./db-comments.component.less']
})
export class DbCommentsComponent extends TeamcraftComponent implements OnInit {

  @Input()
  type: string;

  @Input()
  id: number;

  comments$: Observable<DbComment[]>;

  userId$: Observable<string>;

  loggedIn$: Observable<boolean>;

  newCommentContent: string;

  addRootComment = false;

  submitting = false;

  constructor(private commentsService: DbCommentsService, private authFacade: AuthFacade, private translate: TranslateService,
              @Inject(PLATFORM_ID) private platform: Object) {
    super();
    this.userId$ = this.authFacade.userId$;
    this.loggedIn$ = this.authFacade.loggedIn$;
  }

  ngOnInit() {
    this.comments$ = this.commentsService.getComments(`${this.type}/${this.id}`)
      .pipe(
        takeUntil(this.onDestroy$),
        isPlatformServer(this.platform) ? first() : tap()
      );
  }

  postComment(userId: string, parentComment?: DbComment): void {
    this.submitting = true;
    const comment = new DbComment();
    comment.date = Date.now();
    comment.author = userId;
    comment.language = this.translate.currentLang;
    comment.message = this.newCommentContent;
    comment.resourceId = `${this.type}/${this.id}`;
    if (parentComment) {
      comment.parent = parentComment.$key;
    }
    this.commentsService.add(comment).subscribe(() => {
      this.newCommentContent = '';
      this.submitting = false;
      this.addRootComment = false;
    });
  }

  like(comment: DbComment): void {
    //TODO
  }

  dislike(comment: DbComment): void {
    //TODO
  }

}
