import { Component, OnInit } from '@angular/core';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, first, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { List } from '../../../modules/list/model/list';
import { ListRow } from '../../../modules/list/model/list-row';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LayoutEditorComponent } from '../../../modules/layout-editor/layout-editor/layout-editor.component';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { TagsPopupComponent } from '../../../modules/list/tags-popup/tags-popup.component';
import { ListHistoryPopupComponent } from '../list-history-popup/list-history-popup.component';
import { InventoryViewComponent } from '../inventory-view/inventory-view.component';
import { PermissionsBoxComponent } from '../../../modules/permissions/permissions-box/permissions-box.component';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { ListDisplay } from '../../../core/layout/list-display';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { AuthFacade } from '../../../+state/auth.facade';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.component.html',
  styleUrls: ['./list-details.component.less']
})
export class ListDetailsComponent implements OnInit {

  public display$: Observable<ListDisplay>;

  public finalItemsRow$: Observable<LayoutRowDisplay>;

  public list$: Observable<List>;

  public crystals$: Observable<ListRow[]>;

  public permissionLevel$: Observable<PermissionLevel> = this.listsFacade.selectedListPermissionLevel$;

  public teams$: Observable<Team[]>;

  public assignedTeam$: Observable<Team>;

  public canRemoveTag$: Observable<boolean>;

  public outDated$: Observable<boolean>;

  public listIsLarge: boolean;

  public pricingMode = false;

  public loggedIn$ = this.authFacade.loggedIn$;

  public hideCompleted$: Observable<boolean>;

  private adaptativeFilter$ = new BehaviorSubject<boolean>(false);

  public get adaptativeFilter(): boolean {
    return this.adaptativeFilter$.value;
  }

  public set adaptativeFilter(value: boolean) {
    this.adaptativeFilter$.next(value);
  }

  constructor(private layoutsFacade: LayoutsFacade, public listsFacade: ListsFacade,
              private activatedRoute: ActivatedRoute, private dialog: NzModalService,
              private translate: TranslateService, private router: Router,
              private alarmsFacade: AlarmsFacade, private message: NzMessageService,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private teamsFacade: TeamsFacade, private authFacade: AuthFacade,
              private discordWebhookService: DiscordWebhookService, private i18nTools: I18nToolsService,
              private l12n: LocalizedDataService) {
    this.list$ = combineLatest(this.listsFacade.selectedList$, this.permissionLevel$).pipe(
      filter(([list]) => list !== undefined),
      tap(([list, permissionLevel]) => {
        if (!list.notFound && list.isOutDated() && permissionLevel >= PermissionLevel.WRITE) {
          this.regenerateList(list);
        }
        if (list.teamId !== undefined) {
          this.teamsFacade.loadTeam(list.teamId);
          this.teamsFacade.select(list.teamId);
        }
        this.listIsLarge = list.isLarge();
      }),
      map(([list]) => list),
      shareReplay(1)
    );
    this.finalItemsRow$ = combineLatest(this.list$, this.adaptativeFilter$).pipe(
      mergeMap(([list, adaptativeFilter]) => this.layoutsFacade.getFinalItemsDisplay(list, adaptativeFilter))
    );
    this.display$ = combineLatest(this.list$, this.adaptativeFilter$).pipe(
      mergeMap(([list, adaptativeFilter]) => this.layoutsFacade.getDisplay(list, adaptativeFilter)),
      shareReplay(1)
    );
    this.crystals$ = this.list$.pipe(
      map(list => list.crystals)
    );
    this.hideCompleted$ = this.layoutsFacade.selectedLayout$.pipe(
      map(layout => {
        return layout.rows.reduce((hide, row) => row.hideCompletedRows && hide, false);
      })
    );

    this.teams$ = this.teamsFacade.myTeams$;
    this.assignedTeam$ = this.teamsFacade.selectedTeam$;
    this.outDated$ = this.list$.pipe(map(list => list.isOutDated()));
    this.canRemoveTag$ = combineLatest(this.assignedTeam$, this.authFacade.userId$, this.permissionLevel$)
      .pipe(
        map(([team, userId, permissionsLevel]) => team.leader === userId || permissionsLevel >= PermissionLevel.OWNER)
      );
  }

  ngOnInit() {
    this.layoutsFacade.loadAll();
    this.teamsFacade.loadMyTeams();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('listId')),
        tap((listId: string) => this.listsFacade.load(listId))
      )
      .subscribe(listId => {
        this.listsFacade.select(listId);
      });
    this.teamsFacade.selectedTeam$.pipe(
      filter(team => team && team.notFound),
      switchMap(() => {
        return this.list$.pipe(first());
      })
    ).subscribe(list => {
      delete list.teamId;
      this.listsFacade.updateList(list);
    });
  }

  setHideCompleted(value: boolean): void {
    this.layoutsFacade.selectedLayout$.pipe(
      first(),
      map(layout => {
        layout.rows = layout.rows.map(row => {
          row.hideCompletedRows = value;
          return row;
        });
        return layout;
      })
    ).subscribe(layout => {
      this.layoutsFacade.updateLayout(layout);
    });
  }

  assignTeam(list: List, team: Team): void {
    list.teamId = team.$key;
    this.listsFacade.updateList(list);
    if (team.webhook !== undefined) {
      this.discordWebhookService.notifyListAddedToTeam(team, list);
    }
  }

  removeTeam(list: List, team: Team): void {
    delete list.teamId;
    if (team.webhook !== undefined) {
      this.discordWebhookService.notifyListRemovedFromTeam(team, list);
    }
    this.listsFacade.updateList(list);
  }

  renameList(list: List): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: list.name },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        list.name = name;
        return list;
      })
    ).subscribe(l => this.listsFacade.updateList(l));
  }

  editNote(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Edit_note'),
      nzFooter: null,
      nzContent: TextQuestionPopupComponent,
      nzComponentParams: { baseText: list.note }
    }).afterClose.pipe(
      filter(note => note !== undefined)
    ).subscribe((note) => {
      list.note = note;
      this.listsFacade.updateList(list);
    });
  }

  createAlarms(list: List): void {
    this.alarmsFacade.allAlarms$.pipe(
      first(),
      map(alarms => {
        const listAlarms = [];
        list.forEach(row => {
          // We don't want to create alarms for the clusters.
          if (row.id < 20) {
            return;
          }
          listAlarms.push(...row.alarms.filter(alarm => {
            // Avoid duplicates.
            return listAlarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId) === undefined;
          }));
        });
        return listAlarms.filter(alarm => {
          return alarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId) === undefined;
        });
      })
    ).subscribe(alarms => {
      this.alarmsFacade.addAlarmsAndGroup(alarms, list.name);
    });
  }

  cloneList(list: List): void {
    const clone = list.clone();
    this.listsFacade.updateList(list);
    this.listsFacade.addList(clone);
    this.progressService.showProgress(this.listsFacade.myLists$.pipe(
      map(lists => lists.find(l => l.createdAt === clone.createdAt && l.$key !== undefined)),
      filter(l => l !== undefined),
      first()
    ), 1, 'List_fork_in_progress').pipe(first()).subscribe(l => {
      this.router.navigate(['list', l.$key]);
      this.message.success(this.translate.instant('List_forked'));
    });
  }

  public getListTextExport(display: ListDisplay, list: List): string {
    const seed = list.items.filter(row => row.id < 20).reduce((exportString, row) => {
      return exportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`;
    }, `${this.translate.instant('Crystals')} :\n`) + '\n';
    return display.rows.reduce((result, displayRow) => {
      return result + displayRow.rows.reduce((exportString, row) => {
        return exportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`;
      }, `${displayRow.title} :\n`) + '\n';
    }, seed);

  }

  afterListTextCopied(): void {
    this.message.success(this.translate.instant('LIST.Copied_as_text'));
  }

  regenerateList(list: List): void {
    this.progressService.showProgress(this.listManager.upgradeList(list), 1, 'List_popup_title')
      .pipe(first())
      .subscribe((updatedList) => {
        this.listsFacade.updateList(updatedList);
      });
  }

  resetList(list: List): void {
    list.reset();
    this.listsFacade.updateList(list);
  }

  openLayoutOptions(): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: LayoutEditorComponent
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
      })
    ).subscribe(() => {
      this.listsFacade.updateList(list);
    });
  }

  openInventoryPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Inventory_breakdown'),
      nzFooter: null,
      nzContent: InventoryViewComponent,
      nzComponentParams: { list: list }
    });
  }

  openHistoryPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST.History'),
      nzFooter: null,
      nzContent: ListHistoryPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  trackByDisplayRow(index: number, row: LayoutRowDisplay): string {
    return row.filterChain + row.title;
  }

}
