import { Component, Input, OnInit } from '@angular/core';
import { DbCommentsService } from '../db-comments.service';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { DbComment } from '../model/db-comment';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { AuthFacade } from '../../../../+state/auth.facade';
import { TranslateService } from '@ngx-translate/core';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { UserLevel } from '../../../../model/other/user-level';
import { Router } from '@angular/router';
import { DbItemCommentNotification } from '../../../../model/notification/db-item-comment-notification';
import { NotificationService } from '../../../../core/notification/notification.service';
import { environment } from '../../../../../environments/environment';
import { DbCommentReplyNotification } from '../../../../model/notification/db-comment-reply-notification';
import { XivapiPatch } from '../../../../core/data/model/xivapi-patch';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-db-comments',
  templateUrl: './db-comments.component.html',
  styleUrls: ['./db-comments.component.less']
})
export class DbCommentsComponent extends TeamcraftComponent implements OnInit {
  userLevels = UserLevel;

  readonly comments$: Observable<DbComment[]>;

  readonly user$: Observable<TeamcraftUser> = this.authFacade.user$;

  readonly loggedIn$: Observable<boolean> = this.authFacade.loggedIn$;

  newCommentContent: string;

  addRootComment = false;

  hideRootCommentButton = false;

  editingComment: DbComment;

  parentComment: DbComment;

  submitting = false;

  readonly showMoreComments$ = new BehaviorSubject<boolean>(false);

  readonly hasMoreComments$: Observable<number>;

  private readonly lang$ = new BehaviorSubject<string>(this.translate.currentLang);

  private readonly type$ = new BehaviorSubject<string | undefined>(undefined);

  private readonly id$ = new BehaviorSubject<number | undefined>(undefined);

  constructor(
    private commentsService: DbCommentsService,
    private authFacade: AuthFacade,
    public translate: TranslateService,
    private router: Router,
    private lazyData: LazyDataFacade,
    private notificationService: NotificationService
  ) {
    super();

    const comments$ = combineLatest([this.type$, this.id$, this.loggedIn$]).pipe(
      filter(([type, id, loggedIn]) => !!type && !!id && !!loggedIn),
      switchMap(([type, id]) => {
        return combineLatest([this.commentsService.getComments(`${type}/${id}`), this.lang$]);
      }),
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
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.comments$ = combineLatest([comments$, this.showMoreComments$]).pipe(
      map(([comments, showMore]) => {
        if (showMore) {
          return comments;
        }
        return comments.slice(0, 3);
      })
    );

    this.hasMoreComments$ = comments$.pipe(map((comments) => Math.max(0, comments.length - 3)));
  }

  @Input()
  public set type(t: string) {
    this.type$.next(t || undefined);
  }

  @Input()
  public set id(i: number) {
    this.id$.next(i || undefined);
  }

  ngOnInit() {
    this.translate.onLangChange.pipe(takeUntil(this.onDestroy$)).subscribe((change) => {
      this.lang$.next(change.lang);
    });
  }

  getPatch(comment: DbComment): Observable<XivapiPatch> {
    return this.lazyData.patches$.pipe(
      map(patches => {
        let version = patches[0];
        for (const patch of patches) {
          if (patch.ReleaseDate <= comment.date / 1000) {
            version = patch;
          } else {
            break;
          }
        }
        return version;
      })
    );
  }

  handleClick(event: any): void {
    if (event.srcElement.tagName === 'A') {
      if ((<any>event.srcElement).href.indexOf('ffxivteamcraft.com') > -1 || (<any>event.srcElement).href.indexOf('localhost') > -1) {
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
      return b.date - a.date;
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
    comment.resourceId = `${this.type$.getValue()}/${this.id$.getValue()}`;
    if (parentComment) {
      comment.parent = parentComment.$key;
    }
    this.commentsService
      .add(comment)
      .pipe(
        switchMap(() => {
          if (parentComment && parentComment.author && parentComment.author !== comment.author) {
            // If comment has parent, send a notification to the author of the parent
            const parentNotification = new DbCommentReplyNotification(comment.message, comment.resourceId, parentComment.author);
            return this.notificationService.add(parentNotification);
          }
          return of(null);
        }),
        switchMap(() => {
          // Monitor all new comments for now.
          const notification = new DbItemCommentNotification(
            comment.message,
            comment.resourceId,
            environment.production ? 'N9iJj4tdcBOQpxH7qGdrRxJpxa32' : 'QxjvpGIgGUdWG6nLbOP6RgoswSC2'
          );
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
    comment.dislikes = comment.dislikes.filter((id) => id !== userId);
    if (!comment.likes.some((id) => id === userId)) {
      comment.likes.push(userId);
      this.saveComment(comment).subscribe();
    }
  }

  dislike(comment: DbComment, userId: string): void {
    comment.likes = comment.likes.filter((id) => id !== userId);
    if (!comment.dislikes.some((id) => id === userId)) {
      comment.dislikes.push(userId);
      this.saveComment(comment).subscribe();
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
