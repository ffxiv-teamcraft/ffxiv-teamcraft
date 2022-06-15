import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { List } from '../../../modules/list/model/list';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
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
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { SeoService } from '../../../core/seo/seo.service';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { ListLayout } from '../../../core/layout/list-layout';
import { MediaObserver } from '@angular/flex-layout';
import { ListContributionsComponent } from '../list-contributions/list-contributions.component';
import { IpcService } from '../../../core/electron/ipc.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { InventorySynthesisPopupComponent } from '../inventory-synthesis-popup/inventory-synthesis-popup.component';
import { PlatformService } from '../../../core/tools/platform.service';
import { DataType } from '../../../modules/list/data/data-type';
import { ListSplitPopupComponent } from '../../../modules/list/list-split-popup/list-split-popup.component';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { InventoryCleanupPopupComponent } from '../inventory-cleanup-popup/inventory-cleanup-popup.component';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { ListController } from '../../../modules/list/list-controller';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { uniq } from 'lodash';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.component.html',
  styleUrls: ['./list-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailsComponent extends TeamcraftPageComponent implements OnInit, OnDestroy {

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

  public loggedIn$ = this.authFacade.loggedIn$;

  public hideCompletedGlobal$: LocalStorageBehaviorSubject<boolean> = new LocalStorageBehaviorSubject<boolean>('hide-completed-rows', false);

  public layouts$: Observable<ListLayout[]>;

  public selectedLayout$: Observable<ListLayout>;

  public machinaToggle = false;

  public pinnedList$ = this.listsFacade.pinnedList$;

  public inventories$ = this.inventoryFacade.inventory$.pipe(
    distinctUntilChanged((a, b) => a.getContainers().length === b.getContainers().length),
    map(inventory => {
      if (this.settings.showOthercharacterInventoriesInList) {
        return uniq(inventory.getContainers().map(e => this.inventoryFacade.getContainerDisplayName(e)));
      } else {
        return uniq(inventory.getContainers()
          .filter(container => container.isCurrentCharacter)
          .map(e => this.inventoryFacade.getContainerDisplayName(e)));
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private adaptativeFilter$ = new BehaviorSubject<boolean>(localStorage.getItem('adaptative-filter') === 'true');

  private regeneratingList = false;

  constructor(private layoutsFacade: LayoutsFacade, public listsFacade: ListsFacade,
              private activatedRoute: ActivatedRoute, private dialog: NzModalService,
              private translate: TranslateService, private router: Router,
              private alarmsFacade: AlarmsFacade, private message: NzMessageService,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private teamsFacade: TeamsFacade, private authFacade: AuthFacade,
              private discordWebhookService: DiscordWebhookService, private i18n: I18nToolsService,
              private linkTools: LinkToolsService, protected seoService: SeoService,
              private media: MediaObserver, public ipc: IpcService, private inventoryFacade: InventoryService,
              public settings: SettingsService, public platform: PlatformService, private commissionsFacade: CommissionsFacade) {
    super(seoService);
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.send('toggle-machina:get');
    this.list$ = combineLatest([this.listsFacade.selectedList$, this.permissionLevel$]).pipe(
      filter(([list]) => list !== undefined),
      tap(([list, permissionLevel]) => {
        if (!list.notFound && ListController.isOutDated(list) && permissionLevel >= PermissionLevel.WRITE && !this.regeneratingList) {
          this.regenerateList(list);
        }
        if (!list.notFound) {
          this.listIsLarge = ListController.isLarge(list);
          if (!ListController.isOutDated(list)) {
            this.regeneratingList = false;
          }
        }
      }),
      map(([list]) => list),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.layouts$ = this.layoutsFacade.allLayouts$;
    this.selectedLayout$ = this.layoutsFacade.selectedLayout$;
    this.finalItemsRow$ = combineLatest([this.list$, this.adaptativeFilter$, this.hideCompletedGlobal$]).pipe(
      switchMap(([list, adaptativeFilter, overrideHideCompleted]) => this.layoutsFacade.getFinalItemsDisplay(list, adaptativeFilter, overrideHideCompleted))
    );
    this.display$ = combineLatest([this.list$, this.adaptativeFilter$, this.hideCompletedGlobal$]).pipe(
      switchMap(([list, adaptativeFilter, overrideHideCompleted]) => this.layoutsFacade.getDisplay(list, adaptativeFilter, overrideHideCompleted)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.crystals$ = this.list$.pipe(
      map(list => ListController.getCrystals(list).sort((a, b) => a.id - b.id))
    );

    this.teams$ = this.teamsFacade.myTeams$;
    this.assignedTeam$ = this.teamsFacade.selectedTeam$;
    this.outDated$ = this.list$.pipe(map(list => !list.notFound && ListController.isOutDated(list)));
    this.canRemoveTag$ = combineLatest([this.assignedTeam$, this.authFacade.userId$, this.permissionLevel$])
      .pipe(
        map(([team, userId, permissionsLevel]) => team.leader === userId || permissionsLevel >= PermissionLevel.OWNER)
      );

    combineLatest([this.list$, this.teamsFacade.allTeams$, this.teamsFacade.selectedTeam$]).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(([list, teams]) => {
      if (list.teamId !== undefined) {
        if (!teams.some(team => team.$key === list.teamId)) {
          this.teamsFacade.loadTeam(list.teamId);
        }
        this.teamsFacade.select(list.teamId);
      }
    });
  }

  public get adaptativeFilter(): boolean {
    return this.adaptativeFilter$.value;
  }

  public set adaptativeFilter(value: boolean) {
    this.adaptativeFilter$.next(value);
  }

  ngOnInit() {
    super.ngOnInit();
    this.layoutsFacade.loadAll();
    this.teamsFacade.loadMyTeams();
    this.layoutsFacade.loadAll();
    this.listsFacade.loadMyLists();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('listId')),
        tap((listId: string) => this.listsFacade.load(listId)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(listId => {
        this.listsFacade.select(listId);
      });
    this.teamsFacade.selectedTeam$.pipe(
      filter(team => team && team.notFound),
      switchMap(() => {
        return this.list$.pipe(first());
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(list => {
      delete list.teamId;
      this.listsFacade.updateList(list);
    });
  }

  public selectLayout(layout: ListLayout): void {
    this.layoutsFacade.select(layout);
  }

  toggleAutomaticHQFlag(list: List, flag: boolean): void {
    this.listsFacade.pureUpdateList(list.$key, {
      disableHQSuggestions: flag
    });
  }

  setPublicFlag(list: List, flag: boolean): void {
    this.listsFacade.pureUpdateList(list.$key, {
      public: flag
    });
  }

  getLink = (list: List) => {
    return this.linkTools.getLink(`/list/${list.$key}`);
  };

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

  unArchiveList(list: List): void {
    list.archived = false;
    this.listsFacade.pureUpdateList(list.$key, { archived: false });
  }

  archiveList(list: List): void {
    list.archived = true;
    this.listsFacade.pureUpdateList(list.$key, { archived: true });
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
        ListController.forEach(list, row => {
          // We don't want to create alarms for the clusters.
          if (row.id < 20) {
            return;
          }
          listAlarms.push(...(getItemSource(row, DataType.ALARMS)).filter(alarm => {
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
    this.listsFacade.loadMyLists();
    const clone = ListController.clone(list);
    this.listsFacade.updateList(list);
    this.listManager.upgradeList(clone).pipe(
      first()
    ).subscribe(updatedClone => {
      this.listsFacade.addList(updatedClone);
    });
    this.progressService.showProgress(this.listsFacade.myLists$.pipe(
      map(lists => lists.find(l => l.createdAt.seconds === clone.createdAt.seconds && l.$key !== undefined)),
      filter(l => l !== undefined),
      first()
    ), 1, 'List_fork_in_progress')
      .pipe(
        first()
      )
      .subscribe(l => {
        this.router.navigate(['list', l.$key]);
        this.message.success(this.translate.instant('List_forked'));
      });
  }

  appendExportStringWithRow(exportString: string, row: ListRow, itemName: string): string {
    const remaining = row.amount - (row.done || 0);
    return (remaining > 0) ? (exportString + `${remaining}x ${itemName}\n`) : exportString;
  }

  public getListTextExport = (display: ListDisplay, list: List) => {
    return safeCombineLatest([
      safeCombineLatest(list.items.filter((item) => item.id < 20).map(
        item => {
          return this.i18n.getNameObservable('items', item.id).pipe(
            map(itemName => ({ item, itemName }))
          );
        }
      )).pipe(
        map(rows => ({ title: this.translate.instant('Crystals'), rows }))
      ),
      ...display.rows.map(
        row => {
          return safeCombineLatest(row.rows.map(item => {
            return this.i18n.getNameObservable('items', item.id).pipe(
              map(itemName => ({ item, itemName }))
            );
          })).pipe(
            map(rows => {
              return { title: this.translate.instant(row.title), rows };
            })
          );
        }
      )
    ]).pipe(
      map((displayRows) => {
        return displayRows.reduce((result, displayRow) => {
          return result + displayRow.rows.reduce((exportString, { item, itemName }) => {
            return this.appendExportStringWithRow(exportString, item, itemName);
          }, `${displayRow.title} :\n`) + '\n';
        }, '');
      })
    );

  };

  isTooLarge(list: List): boolean {
    return ListController.isTooLarge(list);
  }

  regenerateList(list: List): void {
    this.regeneratingList = true;
    this.progressService.showProgress(this.listManager.upgradeList(list), 1, 'List_popup_title')
      .pipe(first())
      .subscribe((updatedList) => {
        this.listsFacade.updateList(updatedList, false, true);
      });
  }

  resetList(list: List): void {
    ListController.reset(list);
    this.listsFacade.updateList(list);
    this.listsFacade.clearModificationsHistory(list);
  }

  openLayoutOptions(): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: LayoutEditorComponent,
      nzWidth: (this.media.isActive('xs') || this.media.isActive('sm')) ? '90vw' : '60vw'
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

  openSplitPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Split_list'),
      nzFooter: null,
      nzContent: ListSplitPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  openContributionsPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Contributions_popup'),
      nzFooter: null,
      nzContent: ListContributionsComponent,
      nzBodyStyle: {
        padding: '0'
      }
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
      }),
      takeUntil(this.onDestroy$)
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

  openInventorySynthesisPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Inventory_synthesis'),
      nzFooter: null,
      nzContent: InventorySynthesisPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  openInventoryCleanupPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Inventory_cleanup'),
      nzFooter: null,
      nzContent: InventoryCleanupPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  openHistoryPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST.History'),
      nzFooter: null,
      nzContent: ListHistoryPopupComponent
    });
  }

  public fillWithInventory(list: List, containerName: string): void {
    this.inventoryFacade.inventory$.pipe(
      first(),
      map(inventory => {
        list.items.forEach(item => {
          let inventoryItems = inventory.getItem(item.id)
            .filter(e => {
              return containerName === null || this.inventoryFacade.getContainerDisplayName(e) === containerName;
            });
          const requiredHq = ListController.requiredAsHQ(list, item) > 0;
          if (requiredHq && this.settings.enableAutofillHQFilter) {
            inventoryItems = inventoryItems.filter(i => i.hq);
          }
          if (!requiredHq && this.settings.enableAutofillNQFilter) {
            inventoryItems = inventoryItems.filter(i => !i.hq);
          }
          if (inventoryItems.length > 0) {
            let totalAmount = inventoryItems.reduce((total, i) => total + i.quantity, 0);
            if (item.done + totalAmount > item.amount) {
              totalAmount = item.amount - item.done;
            }
            ListController.setDone(list, item.id, totalAmount, true, false);
          }
        });
        list.finalItems.forEach(item => {
          let inventoryItems = inventory.getItem(item.id)
            .filter(e => {
              return containerName === null || this.inventoryFacade.getContainerDisplayName(e) === containerName;
            });
          const requiredHq = ListController.requiredAsHQ(list, item) > 0;
          if (requiredHq && this.settings.enableAutofillHQFilter) {
            inventoryItems = inventoryItems.filter(i => i.hq);
          }
          if (!requiredHq && this.settings.enableAutofillNQFilter) {
            inventoryItems = inventoryItems.filter(i => !i.hq);
          }
          if (inventoryItems.length > 0) {
            const totalAmount = inventoryItems.reduce((total, i) => total + i.quantity, 0);
            ListController.setDone(list, item.id, Math.min(item.done + totalAmount, item.amount), false, true, false, null, true);
          }
        });
        ListController.updateAllStatuses(list);
        list.etag++;
        return list;
      })
    ).subscribe(res => {
      this.listsFacade.updateList(res);
    });
  }

  public syncWithInventory(list: List): void {
    this.inventoryFacade.inventory$.pipe(
      first(),
      map(inventory => {
        list.items.forEach(item => {
          const inventoryItems = inventory.getItem(item.id, true);
          if (inventoryItems.length > 0) {
            const totalAmount = inventoryItems.reduce((total, i) => total + i.quantity, 0);
            ListController.setDone(list, item.id, Math.min(totalAmount, item.amount), true);
          }
        });
        list.finalItems.forEach(item => {
          const inventoryItems = inventory.getItem(item.id, true);
          if (inventoryItems.length > 0) {
            const totalAmount = inventoryItems.reduce((total, i) => total + i.quantity, 0);
            ListController.setDone(list, item.id, Math.min(totalAmount, item.amount), false, true);
          }
        });
        return list;
      })
    ).subscribe(res => {
      this.listsFacade.updateList(res);
    });
  }

  createCommission(list: List): void {
    this.commissionsFacade.create(list);
  }

  trackByDisplayRow(index: number, row: LayoutRowDisplay): string {
    return row.filterChain + row.title;
  }

  ngOnDestroy(): void {
    this.list$.pipe(first()).subscribe(list => {
      this.listsFacade.unload(list.$key);
    });
    this.listsFacade.toggleAutocomplete(false);
    super.ngOnDestroy();
  }

  public pinList(list: List): void {
    this.listsFacade.pin(list.$key);
  }

  public unpinList(): void {
    this.listsFacade.unpin();
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.list$.pipe(
      map(list => {
        return {
          title: list.name,
          description: list.note,
          url: `https://ffxivteamcraft.com/list/${list.$key}`
        };
      })
    );
  }

}
