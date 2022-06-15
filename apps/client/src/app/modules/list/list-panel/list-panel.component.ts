import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { List } from '../model/list';
import { ListsFacade } from '../+state/lists.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { ListRow } from '../model/list-row';
import { TagsPopupComponent } from '../tags-popup/tags-popup.component';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { debounceTime, distinctUntilChanged, filter, first, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
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
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ListSplitPopupComponent } from '../list-split-popup/list-split-popup.component';
import { ListController } from '../list-controller';
import { PermissionsController } from '../../../core/database/permissions-controller';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPanelComponent extends TeamcraftComponent {

  //Bound for number of a single item in a list
  minAmount = 1;

  @Input()
  publicDisplay = false;

  @Input()
  hideAvatar = false;

  public user$ = this.authFacade.user$;

  public teams$: Observable<Team[]> = this.teamsFacade.myTeams$;

  public availableColors = Object.keys(ListColor).map(key => {
    return {
      value: ListColor[key],
      name: key
    };
  });

  private list$: ReplaySubject<List> = new ReplaySubject<List>();

  public listTemplate$: Observable<ListTemplate> = combineLatest([this.customLinksFacade.myCustomLinks$, this.list$]).pipe(
    map(([links, list]) => {
      return <ListTemplate>links.find(link => {
        return link.type === 'template' && (<ListTemplate>link).originalListId === list.$key;
      });
    })
  );

  public listContent$: Observable<ListRow[]> = combineLatest([this.list$, this.layoutsFacade.selectedLayout$]).pipe(
    switchMap(([list, layout]) => {
      return this.layoutOrderService.order(list.finalItems, layout.recipeOrderBy, layout.recipeOrder);
    })
  );

  isFavorite$: Observable<{ value: boolean }> = combineLatest([this.authFacade.favorites$, this.list$]).pipe(
    filter(([favorites]) => favorites !== undefined),
    map(([favorites, list]) => {
      return {
        value: favorites.lists.indexOf(list.$key) > -1
      };
    })
  );

  permissionLevel$: Observable<{ value: PermissionLevel }> = combineLatest([this.teamsFacade.myTeams$, this.authFacade.loggedIn$]).pipe(
    switchMap(([teams, loggedIn]) => {
      return combineLatest([
        this.authFacade.userId$,
        loggedIn ? this.authFacade.user$ : of(null),
        this.list$,
        this.isFavorite$
      ]).pipe(
        map(([userId, user, list, isFavorite]) => {
          if (user !== null) {
            const isTeamList = list.teamId && teams.some(team => list.teamId === team.$key);
            const teamLeader = isTeamList && (teams.find(team => list.teamId === team.$key).leader === userId);
            return [Math.max(
              PermissionsController.getPermissionLevel(list, userId),
              PermissionsController.getPermissionLevel(list, user.currentFcId),
              isTeamList ? PermissionLevel.PARTICIPATE : PermissionLevel.NONE,
              teamLeader ? PermissionLevel.WRITE : PermissionLevel.NONE
            ), isFavorite.value];
          } else {
            return [PermissionsController.getPermissionLevel(list, userId), isFavorite.value];
          }
        }),
        map(([permissionLevel, isFavorite]: [PermissionLevel, boolean]) => {
          if (isFavorite) {
            return Math.max(10, permissionLevel);
          }
          if (this.publicDisplay && permissionLevel < 40) {
            return 0;
          }
          return permissionLevel;
        }),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }),
    map(level => {
      return {
        value: level
      };
    })
  );

  private syncLinkUrl: string;

  public customLink$: Observable<CustomLink> = combineLatest([this.customLinksFacade.myCustomLinks$, this.list$]).pipe(
    map(([links, list]) => links.find(link => link.redirectTo === `list/${list.$key}`)),
    tap(link => link !== undefined ? this.syncLinkUrl = link.getUrl() : null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private updateAmountDebounces: { [index: number]: Subject<any> } = {};

  constructor(private listsFacade: ListsFacade, private message: NzMessageService,
              public translate: TranslateService, private linkTools: LinkToolsService,
              private dialog: NzModalService, private listManager: ListManagerService,
              public authFacade: AuthFacade, private customLinksFacade: CustomLinksFacade,
              private discordWebhookService: DiscordWebhookService, private teamsFacade: TeamsFacade,
              private router: Router, private layoutsFacade: LayoutsFacade, private layoutOrderService: LayoutOrderService,
              private cd: ChangeDetectorRef, public settings: SettingsService) {
    super();
  }

  public _list: List;

  @Input()
  public set list(l: List) {
    this._list = l;
    this.list$.next(l);
  }

  public outDated(): boolean {
    return this.list && ListController.isOutDated(this.list);
  }

  deleteList(list: List): void {
    this.listsFacade.deleteList(list.$key, list.offline);
  }

  getLink = () => {
    return this.syncLinkUrl ? this.syncLinkUrl : this.linkTools.getLink(`/list/${this._list.$key}`);
  };

  openList(favorite: boolean): void {
    if (!this.publicDisplay || favorite) {
      this.router.navigate(['/list', this._list.$key]);
    }
  }

  leaveList(list: List, userId: string): void {
    delete list.registry[userId];
    this.listsFacade.updateList(list);
  }

  cloneList(list: List): void {
    this.listsFacade.loadMyLists();
    const clone = ListController.clone(list);
    this.listsFacade.updateList(list);
    this.listManager.upgradeList(clone).pipe(
      first(),
      switchMap(upgradedClone => {
        this.listsFacade.addList(upgradedClone);
        return this.listsFacade.myLists$
          .pipe(
            filter(lists => lists.some(l => l.name === upgradedClone.name && l.$key !== undefined)),
            first()
          );
      })
    ).subscribe(() => {
      this.message.success(this.translate.instant('List_forked'));
    });
  }

  updateAmount(item: ListRow, inputValue: number): void {
    if (inputValue.toString().length === 0) {
      return;
    }
    let updateSubject = this.updateAmountDebounces[item.id];
    if (updateSubject === undefined) {
      updateSubject = new Subject<number>();
      this.updateAmountDebounces[item.id] = updateSubject;
      updateSubject.pipe(
        debounceTime(500),
        switchMap((newAmount: number) => {
          return this.listsFacade.allListDetails$.pipe(
            map(details => details.find(l => l.$key === this._list.$key)),
            filter(l => l !== undefined),
            first(),
            switchMap(listDetails => this.listManager.addToList({
              itemId: item.id,
              list: listDetails,
              recipeId: item.recipeId,
              amount: newAmount - item.amount
            }))
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
    this.listsFacade.pureUpdateList(list.$key, { color: color });
  }

  getTags(): string[] {
    return (this._list.tags || []).filter((tag, i) => this._list.tags.indexOf(tag) === i);
  }

  assignTeam(compact: List, team: Team): void {
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

  removeTeam(list: List, teams: Team[]): void {
    const team = teams.find(t => t.$key === list.teamId);
    delete list.teamId;
    if (team.webhook !== undefined) {
      this.discordWebhookService.notifyListRemovedFromTeam(team, list);
    }
    this.listsFacade.updateList(list, true, true);

  }

  archiveList(list: List, archived: boolean): void {
    list.archived = archived;
    this.listsFacade.pureUpdateList(list.$key, { archived: archived });
  }

  openSplitPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Split_list'),
      nzFooter: null,
      nzContent: ListSplitPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  renameList(_list: List): void {
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
    modalReady$.pipe(
      first(),
      switchMap(() => {
        return modalRef.getContentComponent().changes$;
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      this.listsFacade.updateList(list);
    });
  }

  removeEphemeral(list: List): void {
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

  mouseWheelUpAmount(event: any, item: ListRow): void {
    this.updateAmount(item, ++item.amount);
  }

  mouseWheelDownAmount(event: any, item: ListRow): void {
    if (item.amount > this.minAmount) {
      this.updateAmount(item, --item.amount);
    }
  }
}
