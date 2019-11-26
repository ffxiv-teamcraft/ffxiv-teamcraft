import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { List } from '../model/list';
import { ListsFacade } from '../+state/lists.facade';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { ListRow } from '../model/list-row';
import { TagsPopupComponent } from '../tags-popup/tags-popup.component';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { debounceTime, distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ListManagerService } from '../list-manager.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { PermissionsBoxComponent } from '../../permissions/permissions-box/permissions-box.component';
import { CommentsPopupComponent } from '../../comments/comments-popup/comments-popup.component';
import { CommentTargetType } from '../../comments/comment-target-type';
import { ListCommentNotification } from '../../../model/notification/list-comment-notification';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { ListTemplate } from '../../../core/database/custom-links/list-template';
import { CustomLinksFacade } from '../../custom-links/+state/custom-links.facade';
import { Team } from '../../../model/team/team';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { Router } from '@angular/router';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';
import { SettingsService } from '../../settings/settings.service';
import { ListColor } from '../model/list-color';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPanelComponent {

  @Input()
  public set list(l: List) {
    this._list = l;
    this.list$.next(l);
  }

  @Input()
  publicDisplay = false;

  @Input()
  hideAvatar = false;

  public _list: List;

  private list$: ReplaySubject<List> = new ReplaySubject<List>();

  public user$ = this.authFacade.user$;

  public listTemplate$: Observable<ListTemplate>;

  public customLink$: Observable<CustomLink>;

  public teams$: Observable<Team[]>;

  public listContent$: Observable<ListRow[]>;

  private syncLinkUrl: string;

  private updateAmountDebounces: { [index: number]: Subject<any> } = {};

  public availableColors = Object.keys(ListColor).map(key => {
    return {
      value: ListColor[key],
      name: key
    };
  });

  permissionLevel$: Observable<PermissionLevel> = combineLatest(this.teamsFacade.myTeams$, this.authFacade.loggedIn$).pipe(
    switchMap(([teams, loggedIn]) => {
      return combineLatest(
        this.authFacade.userId$,
        loggedIn ? this.authFacade.user$ : of(null),
        this.list$
      ).pipe(
        map(([userId, user, list]) => {
          if (user !== null) {
            const isTeamList = list.teamId && teams.some(team => list.teamId === team.$key);
            const teamLeader = isTeamList && (teams.find(team => list.teamId === team.$key).leader === userId);
            return Math.max(
              list.getPermissionLevel(userId),
              list.getPermissionLevel(user.currentFcId),
              isTeamList ? PermissionLevel.PARTICIPATE : PermissionLevel.NONE,
              teamLeader ? PermissionLevel.WRITE : PermissionLevel.NONE
            );
          } else {
            return list.getPermissionLevel(userId);
          }
        }),
        map(permissionLevel => {
          if (this.publicDisplay && permissionLevel < 40) {
            return 0;
          }
          return permissionLevel;
        }),
        distinctUntilChanged(),
        shareReplay(1)
      );
    })
  );

  constructor(private listsFacade: ListsFacade, private message: NzMessageService,
              private translate: TranslateService, private linkTools: LinkToolsService,
              private dialog: NzModalService, private listManager: ListManagerService,
              public authFacade: AuthFacade, private customLinksFacade: CustomLinksFacade,
              private discordWebhookService: DiscordWebhookService, private teamsFacade: TeamsFacade,
              private router: Router, private layoutsFacade: LayoutsFacade, private layoutOrderService: LayoutOrderService,
              private cd: ChangeDetectorRef, public settings: SettingsService) {
    this.customLink$ = combineLatest(this.customLinksFacade.myCustomLinks$, this.list$).pipe(
      map(([links, list]) => links.find(link => link.redirectTo === `list/${list.$key}`)),
      tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
      shareReplay(1)
    );

    this.teams$ = this.teamsFacade.myTeams$;

    this.listTemplate$ = combineLatest(this.customLinksFacade.myCustomLinks$, this.list$).pipe(
      map(([links, list]) => {
        return <ListTemplate>links.find(link => {
          return link.type === 'template' && (<ListTemplate>link).originalListId === list.$key;
        });
      })
    );

    this.listContent$ = combineLatest(this.list$, this.layoutsFacade.selectedLayout$).pipe(
      map(([list, layout]) => {
        return this.layoutOrderService.order(list.finalItems, layout.recipeOrderBy, layout.recipeOrder);
      })
    );
  }

  public outDated(): boolean {
    return this.list && this.list.isOutDated && typeof this.list.isOutDated === 'function';
  }

  deleteList(list: List): void {
    this.listsFacade.deleteList(list.$key, list.offline);
  }

  getLink(): string {
    return this.syncLinkUrl ? this.syncLinkUrl : this.linkTools.getLink(`/list/${this._list.$key}`);
  }

  openList(): void {
    if (!this.publicDisplay) {
      this.router.navigate(['/list', this._list.$key]);
    }
  }

  cloneList(compact: List): void {
    // Connect with store to get full list details before cloning
    this.listsFacade.load(compact.$key);
    this.listsFacade.allListDetails$.pipe(
      map(lists => lists.find(l => l.$key === compact.$key)),
      filter(list => list !== undefined),
      first(),
      switchMap(list => {
        const clone = list.clone();
        this.listsFacade.updateList(list);
        this.listsFacade.addList(clone);
        return this.listsFacade.myLists$
          .pipe(
            map(lists => lists.find(l => l.createdAt.toMillis() === clone.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          );
      })
    ).subscribe(() => {
      this.message.success(this.translate.instant('List_forked'));
    });
  }

  updateAmount(item: ListRow, inputValue: number): void {
    let updateSubject = this.updateAmountDebounces[item.id];
    if (updateSubject === undefined) {
      updateSubject = new Subject<number>();
      this.updateAmountDebounces[item.id] = updateSubject;
      updateSubject.pipe(
        debounceTime(500),
        switchMap((newAmount: number) => {
          this.listsFacade.load(this._list.$key);
          return this.listsFacade.allListDetails$.pipe(
            map(details => details.find(l => l.$key === this._list.$key)),
            filter(l => l !== undefined),
            first(),
            switchMap(listDetails => this.listManager.addToList(item.id, listDetails, item.recipeId, newAmount - item.amount))
          );
        }))
        .subscribe(list => {
          delete this.updateAmountDebounces[item.id];
          this.listsFacade.updateList(list, true);
        });
    }
    updateSubject.next(inputValue);
  }

  setColor(color: ListColor, list: List): void {
    list.color = color;
    this.listsFacade.updateList(list);
  }

  getTags(): string[] {
    return (this._list.tags || []).filter((tag, i) => this._list.tags.indexOf(tag) === i);
  }

  assignTeam(compact: List, team: Team): void {
    this.listsFacade.load(compact.$key);
    this.listsFacade.allListDetails$.pipe(
      map(details => details.find(l => l.$key === this._list.$key)),
      filter(l => l !== undefined),
      first(),
      map(list => {
        list.teamId = team.$key;
        return list;
      })
    ).subscribe(list => {
      this.listsFacade.updateList(list, true);
      if (team.webhook !== undefined) {
        this.discordWebhookService.notifyListAddedToTeam(team, list);
      }
    });
  }

  removeTeam(compact: List, teams: Team[]): void {
    const team = teams.find(t => t.$key === compact.teamId);
    this.listsFacade.load(compact.$key);
    this.listsFacade.allListDetails$.pipe(
      map(details => details.find(l => l.$key === this._list.$key)),
      filter(l => l !== undefined),
      first(),
      map(list => {
        delete list.teamId;
        return list;
      })
    ).subscribe(list => {
      this.listsFacade.updateList(list, true, true);
      if (team.webhook !== undefined) {
        this.discordWebhookService.notifyListRemovedFromTeam(team, list);
      }
    });
  }

  renameList(_list: List): void {
    this.listsFacade.load(this._list.$key);
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: _list.name },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      switchMap(name => {
        return this.listsFacade.allListDetails$.pipe(
          map(details => details.find(l => l.$key === this._list.$key)),
          filter(l => l !== undefined),
          first(),
          map(list => {
            list.name = name;
            return list;
          })
        );
      })
    ).subscribe(l => this.listsFacade.updateList(l));
  }

  openPermissionsPopup(list: List): void {
    const modalReady$ = new Subject<void>();
    const modalRef = this.dialog.create({
      nzTitle: this.translate.instant('PERMISSIONS.Title'),
      nzFooter: null,
      nzContent: PermissionsBoxComponent,
      nzComponentParams: { data: list, ready$: modalReady$ }
    });
    this.listsFacade.load(list.$key);
    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().changes$;
      }),
      switchMap(() => {
        return this.listsFacade.allListDetails$.pipe(
          map(details => details.find(l => l.$key === list.$key)),
          filter(l => l !== undefined),
          first(),
          map(changes => {
            Object.assign(list, changes);
            return list;
          })
        );
      })
    ).subscribe((res) => {
      this.listsFacade.updateList(res);
    });
  }

  removeEphemeral(list: List): void {
    this.listsFacade.load(list.$key);
    this.listsFacade.allListDetails$.pipe(
      map(details => details.find(l => l.$key === list.$key)),
      filter(l => l !== undefined),
      first(),
      map(listDetails => {
        listDetails.ephemeral = false;
        return listDetails;
      })
    ).subscribe(listDetails => {
      this.listsFacade.updateList(listDetails);
    });
  }

  openCommentsPopup(list: List, isAuthor: boolean): void {
    this.dialog.create({
      nzTitle: `${list.name} - ${this.translate.instant('COMMENTS.Title')}`,
      nzFooter: null,
      nzContent: CommentsPopupComponent,
      nzComponentParams: {
        targetType: CommentTargetType.LIST,
        targetId: list.$key,
        isAuthor: isAuthor,
        notificationFactory: (comment) => {
          return new ListCommentNotification(comment.content, list.name, list.authorId);
        }
      }
    });
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('Share_link_copied'));
  }

  afterTemplateUrlCopy(): void {
    this.message.success(this.translate.instant('LIST_TEMPLATE.Share_link_copied'));
  }

  openTagsPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Tags_popup'),
      nzFooter: null,
      nzContent: TagsPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  createCustomLink(list: List, user: TeamcraftUser): void {
    this.customLinksFacade.createCustomLink(list.name, `list/${list.$key}`, user);
  }

  afterCustomLinkCopy(): void {
    this.message.success(this.translate.instant('CUSTOM_LINKS.Share_link_copied'));
  }

  createTemplate(list: List, user: TeamcraftUser): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: list.name },
      nzFooter: null,
      nzTitle: this.translate.instant('LIST_TEMPLATE.Create_template')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const template = new ListTemplate();
        template.originalListId = list.$key;
        template.authorId = user.$key;
        template.authorNickname = user.nickname;
        template.uri = name.split('/').join('');
        return template;
      }),
      tap(link => this.customLinksFacade.addCustomLink(link)),
      switchMap(link => {
        return this.customLinksFacade.myCustomLinks$.pipe(
          map(links => links.find(l => l.uri === link.uri && l.$key !== undefined)),
          filter(l => l !== undefined),
          first()
        );
      })
    ).subscribe(link => {
      this.message.success(this.translate.instant('LIST_TEMPLATE.Template_created'));
    });
  }

  openStateChange(): void {
    setTimeout(() => {
      this.cd.detectChanges();
    }, 50);
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

}
