import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { DbCommentsService } from '../db-comments.service';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { DbComment } from '../model/db-comment';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { first, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../../+state/auth.facade';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformServer } from '@angular/common';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { UserLevel } from '../../../../model/other/user-level';
import { Router } from '@angular/router';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { DbItemCommentNotification } from '../../../../model/notification/db-item-comment-notification';
import { NotificationService } from '../../../../core/notification/notification.service';
import { environment } from '../../../../../environments/environment';
import { DbCommentReplyNotification } from '../../../../model/notification/db-comment-reply-notification';

@Component({
  selector: 'app-db-comments',
  templateUrl: './db-comments.component.html',
  styleUrls: ['./db-comments.component.less']
})
export class DbCommentsComponent extends TeamcraftComponent implements OnInit {

  @Input()
  public set type(t: string) {
    this.type$.next(t);
    this._type = t;
  }

  private _type: string;

  private type$ = new ReplaySubject<string>();

  @Input()
  public set id(i: number) {
    this.id$.next(i);
    this._id = i;
  }

  private _id: number;

  private id$ = new ReplaySubject<number>();

  userLevels = UserLevel;

  comments$: Observable<DbComment[]>;

  user$: Observable<TeamcraftUser>;

  loggedIn$: Observable<boolean>;

  newCommentContent: string;

  addRootComment = false;

  hideRootCommentButton = false;

  editingComment: DbComment;

  parentComment: DbComment;

  submitting = false;

  showMoreComments$ = new BehaviorSubject<boolean>(false);

  hasMoreComments$: Observable<number>;

  constructor(private commentsService: DbCommentsService, private authFacade: AuthFacade, public translate: TranslateService,
              @Inject(PLATFORM_ID) private platform: Object, private router: Router, private lazyData: LazyDataService,
              private notificationService: NotificationService) {
    super();
    this.user$ = this.authFacade.user$;
    this.loggedIn$ = this.authFacade.loggedIn$;
  }

  ngOnInit() {
    const contentComments = combineLatest([this.type$, this.id$]).pipe(
      switchMap(([type, id]) => {
        return this.commentsService.getComments(`${type}/${id}`);
      }),
      takeUntil(this.onDestroy$),
      isPlatformServer(this.platform) ? first() : tap()
    );

    const lang$ = new BehaviorSubject<string>(this.translate.currentLang);

    this.translate.onLangChange.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((change) => {
      lang$.next(change.lang);
    });

    const comments$ = combineLatest([contentComments, lang$]).pipe(
      map(([comments, lang]) => {
        return comments.sort((a, b) => {
          if (a.language === lang && b.language === lang) {
            return this.compareComments(a, b);
          }
          if (a.language === lang) {
            return -1;
          }
          if (b.language === lang) {
            return 1;
          }
          return this.compareComments(a, b);
        });
      }),
      shareReplay(1)
    );

    this.comments$ = combineLatest([comments$, this.showMoreComments$]).pipe(
      map(([comments, showMore]) => {
        if (showMore) {
          return comments;
        }
        return comments.slice(0, 3);
      })
    );

    this.hasMoreComments$ = comments$.pipe(map(comments => Math.max(0, comments.length - 3)));
  }

  getPatch(comment: DbComment): string {
    let version = this.lazyData.patches[0];
    for (const patch of this.lazyData.patches) {
      if (patch.ReleaseDate <= comment.date / 1000) {
        version = patch;
      } else {
        break;
      }
    }
    return version;
  }

  handleClick(event: any): void {
    if (event.srcElement.tagName === 'A') {
      if ((<any>event.srcElement).href.indexOf('ffxivteamcraft.com') > -1 ||
        (<any>event.srcElement).href.indexOf('localhost') > -1) {
        // If that's an anchor, intercept the click and handle it properly with router
        this.router.navigateByUrl((<HTMLAnchorElement>event.srcElement).pathname);
      } else {
        window.open((<any>event.srcElement).href, '_blank');
      }
    }
  }

  public compareComments(a: DbComment, b: DbComment): number {
    if (a.deleted) {
      return 1;
    }
    if (b.deleted) {
      return -1;
    }
    if (a.score === b.score) {
      return a.date - b.date;
    }
    return b.score - a.score;
  }

  getLocale(): string {
    return this.translate.currentLang;
  }

  postComment(userId: string, parentComment?: DbComment): void {
    this.submitting = true;
    const comment = new DbComment();
    comment.date = Date.now();
    comment.author = userId;
    comment.language = this.translate.currentLang;
    comment.message = this.newCommentContent;
    comment.resourceId = `${this._type}/${this._id}`;
    if (parentComment) {
      comment.parent = parentComment.$key;
    }
    this.commentsService.add(comment)
      .pipe(
        switchMap(() => {
          if (parentComment && parentComment.author && parentComment.author !== comment.author) {
            // If comment has parent, send a notification to the author of the parent
            const parentNotification = new DbCommentReplyNotification(
              comment.message,
              comment.resourceId,
              parentComment.author);
            return this.notificationService.add(parentNotification);
          }
          return of(null);
        }),
        switchMap(() => {
          // Monitor all new comments for now.
          const notification = new DbItemCommentNotification(
            comment.message,
            comment.resourceId,
            environment.production ? 'N9iJj4tdcBOQpxH7qGdrRxJpxa32' : 'QxjvpGIgGUdWG6nLbOP6RgoswSC2');
          return this.notificationService.add(notification);
        })
      )
      .subscribe(() => {
        this.resetEditor();
      });
  }

  saveCommentEdition(): void {
    this.submitting = true;
    this.saveComment(this.editingComment).subscribe(() => {
      this.resetEditor();
    });
  }

  resetEditor(): void {
    this.newCommentContent = '';
    this.submitting = false;
    this.addRootComment = false;
    this.hideRootCommentButton = false;
    delete this.editingComment;
    delete this.parentComment;
  }

  editComment(comment: DbComment): void {
    this.hideRootCommentButton = true;
    this.editingComment = comment;
  }

  replyTo(comment: DbComment): void {
    this.hideRootCommentButton = true;
    this.parentComment = comment;
  }

  like(comment: DbComment, userId: string): void {
    comment.dislikes = comment.dislikes.filter(id => id !== userId);
    if (!comment.likes.some(id => id === userId)) {
      comment.likes.push(userId);
      this.saveComment(comment);
    }
  }

  dislike(comment: DbComment, userId: string): void {
    comment.likes = comment.likes.filter(id => id !== userId);
    if (!comment.dislikes.some(id => id === userId)) {
      comment.dislikes.push(userId);
      this.saveComment(comment);
    }
  }

  deleteComment(comment: DbComment): void {
    if (comment.replies.length > 0) {
      comment.deleted = true;
      this.saveComment(comment).subscribe();
    } else {
      this.commentsService.remove(comment.$key).subscribe();
    }
  }

  saveComment(comment: DbComment): Observable<void> {
    return this.commentsService.update(comment.$key, { ...comment, replies: [] });
  }

  trackByComment(index: number, comment: DbComment): string {
    return comment.$key;
  }

}
