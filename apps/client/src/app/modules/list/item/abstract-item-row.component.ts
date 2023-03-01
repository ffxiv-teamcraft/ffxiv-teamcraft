import { TeamcraftOptimizedComponent } from '../../../core/component/teamcraft-optimized-component';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { ListRow } from '../model/list-row';
import { debounceTime, distinctUntilChanged, filter, first, map, shareReplay, startWith, switchMap, switchMapTo, takeUntil } from 'rxjs/operators';
import { DataType, getItemSource } from '@ffxiv-teamcraft/types';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { Team } from '../../../model/team/team';
import { List } from '../model/list';
import { ListController } from '../list-controller';
import * as _ from 'lodash';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { ListsFacade } from '../+state/lists.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { UserService } from '../../../core/database/user.service';
import { XivapiService } from '@xivapi/angular-client';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { SettingsService } from '../../settings/settings.service';
import { ListManagerService } from '../list-manager.service';
import { RotationPickerService } from '../../rotations/rotation-picker.service';
import { CommentsService } from '../../comments/comments.service';
import { ListPickerService } from '../../list-picker/list-picker.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ConsumablesService } from '../../../pages/simulator/model/consumables.service';
import { FreeCompanyActionsService } from '../../../pages/simulator/model/free-company-actions.service';
import { InventoryService } from '../../inventory/inventory.service';
import { SimulationService } from '../../../core/simulation/simulation.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { ListLayout } from '../../../core/layout/list-layout';
import { MarketboardPopupComponent } from '../../marketboard/marketboard-popup/marketboard-popup.component';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { CustomItem } from '../../custom-items/model/custom-item';
import { RelationshipsComponent } from '../../item-details/relationships/relationships.component';

@Component({
  template: ''
})
export class AbstractItemRowComponent extends TeamcraftOptimizedComponent implements OnInit {

  private _item$: BehaviorSubject<ListRow> = new BehaviorSubject<ListRow>(null);

  public item$: Observable<ListRow> = this._item$.pipe(
    filter(item => item !== null),
    map(item => {
      const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
      const vendors = getItemSource(item, DataType.VENDORS);
      (<any>item).craftedBy = craftedBy ? craftedBy : null;
      (<any>item).vendors = vendors ? vendors : null;
      item.masterbooks = getItemSource(item, DataType.MASTERBOOKS);
      if (item.recipeId) {
        item.sources = (item.sources || []).map(source => {
          if (source.type === DataType.CRAFTED_BY) {
            return {
              ...source,
              data: source.data
                .filter(c => c.id === item.recipeId)
            };
          }
          return source;
        });
      }
      return item;
    }),
    shareReplay(1)
  );

  buttonsCache = {};

  finalItem$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input()
  odd = false;

  @Input()
  overlay = false;

  @Input()
  permissionLevel: PermissionLevel;

  @Input()
  alarmGroups: AlarmGroup[];

  @Input()
  skip?: number;

  userId$: Observable<string>;

  loggedIn$: Observable<boolean>;

  requiredHQ$: Observable<number>;

  team$: Observable<Team>;

  missingBooks$: Observable<number[]>;

  tagInputVisible = false;

  newTag: string;

  list$: Observable<List> = this.listsFacade.selectedList$;

  @ViewChild('inputElement') inputElement: ElementRef;

  amountInInventory$: Observable<{ containerName: string, amount: number, hq: boolean, isRetainer: boolean }[]> = this.item$.pipe(
    switchMap(item => {
      return combineLatest(([this.settings.settingsChange$.pipe(startWith(0)), this.inventoryService.inventory$])).pipe(
        map(([, inventory]) => {
          return inventory.getItem(item.id)
            .filter(entry => {
              return !this.settings.ignoredInventories.includes(this.inventoryService.getContainerTranslateKey(entry))
                && (this.settings.showOthercharacterInventoriesInList || entry.isCurrentCharacter);
            })
            .map(entry => {
              return {
                item: entry,
                isRetainer: entry.retainerName !== undefined,
                containerName: this.inventoryService.getContainerDisplayName(entry),
                amount: entry.quantity,
                hq: entry.hq
              };
            }).reduce((res, entry) => {
              const resEntry = res.find(e => e.containerName === entry.containerName && e.hq === entry.hq);
              if (resEntry !== undefined) {
                resEntry.amount += entry.amount;
              } else {
                res.push(entry);
              }
              return res;
            }, []);
        })
      );
    })
  );

  totalAmountInInventory$: Observable<{ hq: number, nq: number }> = this.amountInInventory$.pipe(
    map(rows => {
      return rows.reduce((acc, row) => {
        if (row.hq) {
          acc.hq += row.amount;
        } else {
          acc.nq += row.amount;
        }
        if (acc.containers.indexOf(row.containerName) === -1) {
          acc.containers.push(row.containerName);
        }
        return acc;
      }, {
        containers: [],
        hq: 0,
        nq: 0
      });
    })
  );

  itemTags$ = combineLatest([this.item$, this.authFacade.user$]).pipe(
    map(([item, user]) => {
      return (user.itemTags || [])
        .filter(entry => entry.id === item.id)
        .map(entry => entry.tag);
    })
  );

  ignoreRequirements$: Observable<boolean>;

  tagInput$ = new BehaviorSubject<string>('');

  availableTags$ = combineLatest([this.tagInput$, this.authFacade.user$]).pipe(
    map(([input, user]) => {
      return _.uniq(user.itemTags
        .filter(entry => entry.tag.toLowerCase().indexOf(input.toLowerCase()) > -1)
        .map(entry => entry.tag));
    })
  );

  showLogCompletionButton$ = combineLatest([this.authFacade.logTracking$, this.item$]).pipe(
    map(([logTracking, item]) => {
      const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
      const gatheredBy = getItemSource(item, DataType.GATHERED_BY, true);
      if (craftedBy.length > 0) {
        return logTracking.crafting.indexOf(+item.recipeId || +craftedBy[0].id) === -1;
      } else if (gatheredBy.type !== undefined) {
        return logTracking.gathering.indexOf(+item.id) === -1;
      }
      return false;
    }),
    shareReplay(1)
  );

  masterbooksReloader$ = new BehaviorSubject<void>(null);

  showAllAlarmsOverride$ = new BehaviorSubject<boolean>(false);

  public alarmsDisplay$ = combineLatest([
    this.settings.watchSetting('showAllAlarms', false),
    this.item$,
    this.showAllAlarmsOverride$,
    this.etime.getEorzeanTime().pipe(
      distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours())
    )
  ]).pipe(
    debounceTime(10),
    map(([showAllAlarmsSetting, item, showAllAlarmsOverride, etime]) => {
      const showEverything = showAllAlarmsSetting || showAllAlarmsOverride;
      const alarms = getItemSource<PersistedAlarm[]>(item, DataType.ALARMS).sort((a, b) => {
        const aDisplay = this.alarmsFacade.createDisplay(a, etime);
        const bDisplay = this.alarmsFacade.createDisplay(b, etime);
        if (aDisplay.spawned) {
          return -1;
        }
        if (bDisplay.spawned) {
          return 1;
        }
        return aDisplay.remainingTime - bDisplay.remainingTime;
      });
      // We don't want to display more than 6 alarms, else it becomes a large shitfest
      if (!alarms || alarms.length < 6 || showEverything) {
        return {
          alarms,
          moreAvailable: 0
        };
      } else {
        return {
          alarms: alarms.slice(0, 6),
          moreAvailable: alarms.length - 6
        };
      }
    })
  );

  public itemDoneChange$ = new Subject<number>();

  _layout: ListLayout;

  constructor(public listsFacade: ListsFacade, private alarmsFacade: AlarmsFacade,
              protected messageService: NzMessageService, protected translate: TranslateService,
              protected modal: NzModalService,
              protected i18n: I18nToolsService, protected cdRef: ChangeDetectorRef,
              protected userService: UserService, protected xivapi: XivapiService,
              protected authFacade: AuthFacade, protected teamsFacade: TeamsFacade,
              protected discordWebhookService: DiscordWebhookService,
              public settings: SettingsService,
              protected listManager: ListManagerService,
              protected rotationPicker: RotationPickerService,
              protected commentsService: CommentsService,
              protected listPicker: ListPickerService,
              protected notificationService: NzNotificationService,
              public consumablesService: ConsumablesService,
              public freeCompanyActionsService: FreeCompanyActionsService,
              protected inventoryService: InventoryService,
              protected simulationService: SimulationService,
              protected lazyData: LazyDataFacade, protected etime: EorzeanTimeService,
              cd: ChangeDetectorRef) {
    super(cd);

    this.missingBooks$ = this.masterbooksReloader$.pipe(
      switchMapTo(combineLatest([this.authFacade.mainCharacterEntry$, this.item$])),
      map(([entry, item]) => {
        return getItemSource(item, DataType.MASTERBOOKS)
          // Ignore string ids, as they are draft ids
          .filter(book => Number.isInteger(book.id))
          .filter(book => (entry.masterbooks || []).indexOf(+book.id) === -1)
          .map(book => +book.id);
      })
    );

    this.userId$ = this.authFacade.userId$;
    this.loggedIn$ = this.authFacade.loggedIn$;
    this.connectListObservables();
  }

  protected connectListObservables(): void {
    this.team$ = combineLatest([this.list$, this.teamsFacade.selectedTeam$]).pipe(
      map(([list, team]) => {
        if (list.teamId === undefined || (team && list.teamId !== team.$key)) {
          return null;
        }
        return team;
      }),
      shareReplay(1)
    );

    this.requiredHQ$ = this.item$.pipe(
      map((item) => {
        return item.requiredHQ;
      })
    );

    this.ignoreRequirements$ = combineLatest([this.item$, this.list$, this.finalItem$]).pipe(
      map(([item, list, finalItem]) => {
        return ListController.shouldIgnoreRequirements(list, finalItem ? 'finalItems' : 'items', item.id);
      })
    );
  }

  get item(): ListRow {
    return this._item$.value;
  }

  @Input()
  set item(item: ListRow) {
    this._item$.next(item);
  }

  public get finalItem(): boolean {
    return this.finalItem$.value || this.item.finalItem;
  }

  @Input()
  public set finalItem(final: boolean) {
    this.finalItem$.next(final);
  }

  public get layout(): ListLayout {
    return this._layout;
  }

  @Input()
  public set layout(l: ListLayout) {
    if (l) {
      this.buttonsCache = l.buttonsCache;
    }
    this._layout = l;
  }

  protected get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  protected get registry() {
    return this.simulator.CraftingActionsRegistry;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.cdRef.detectChanges();
    });

    this.itemDoneChange$.pipe(
      takeUntil(this.onDestroy$),
      debounceTime(1000)
    ).subscribe(value => {
      this.itemDoneChanged(value, this.item);
    });
  }

  openMarketboardDialog(item: ListRow): void {
    this.i18n.getNameObservable('items', item.id).pipe(
      first()
    ).subscribe(itemName => {
      this.modal.create({
        nzTitle: `${this.translate.instant('MARKETBOARD.Title')} - ${itemName}`,
        nzContent: MarketboardPopupComponent,
        nzComponentParams: {
          itemId: item.id,
          showHistory: true
        },
        nzFooter: null,
        nzWidth: '80vw'
      });
    });
  }

  showTagInput(): void {
    this.tagInputVisible = true;
    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 10);
  }

  markAsDoneInLog(item: ListRow): void {
    const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
    const gatheredBy = getItemSource(item, DataType.GATHERED_BY);
    if (craftedBy.length > 0) {
      this.authFacade.markAsDoneInLog('crafting', +(item.recipeId || craftedBy[0].id), true);
    } else if (gatheredBy.type !== undefined) {
      this.authFacade.markAsDoneInLog('gathering', +item.id, true);
    }
  }

  saveItem(item: ListRow): void {
    this.listsFacade.updateItem(item, this.finalItem);
  }

  itemDoneChanged(newValue: number, item: ListRow): void {
    if (newValue.toString().length === 0) {
      return;
    }
    if (this.settings.displayRemaining) {
      newValue += item.used;
    }
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, newValue - item.done, item.recipeId, item.amount);
  }

  add(amount: string | number, item: ListRow, external = false): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, +amount, item.recipeId, item.amount, external);
  }

  remove(amount: string, item: ListRow, external = false): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, -1 * (+amount), item.recipeId, item.amount, external);
  }

  markAsDone(item: ListRow): void {
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, item.amount - item.done, item.recipeId, item.amount);
  }

  resetDone(item: ListRow): void {
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, -1 * item.done, item.recipeId, item.amount);
  }

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm as PersistedAlarm);
    }
  }

  addAlarmWithGroup(alarm: PersistedAlarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  success(key: string, args?: any): void {
    this.messageService.success(this.translate.instant(key, args));
  }

  addToList(item: ListRow): void {
    this.listPicker.addToList(item);
  }

  addAllAlarms(item: ListRow) {
    this.alarmsFacade.allAlarms$
      .pipe(
        first(),
        switchMap(allAlarms => {
          return this.i18n.getNameObservable('items', item.id).pipe(
            map(itemName => ({ itemName, allAlarms }))
          );
        })
      )
      .subscribe(({ itemName, allAlarms }) => {
        const alarmsToAdd = getItemSource<PersistedAlarm[]>(item, DataType.ALARMS).filter(a => {
          return !allAlarms.some(alarm => {
            return alarm.itemId === a.itemId && alarm.spawns === a.spawns && alarm.zoneId === a.zoneId;
          });
        });
        this.alarmsFacade.addAlarmsAndGroup(alarmsToAdd, itemName);
      });
  }

  public openRequirementsPopup(item: ListRow): void {
    this.i18n.getNameObservable('items', item.id).pipe(
      first()
    ).subscribe(itemName => {
      this.modal.create({
        nzTitle: itemName || (item as CustomItem).name,
        nzContent: RelationshipsComponent,
        nzComponentParams: {
          list$: this.list$,
          item: item,
          finalItem: this.finalItem
        },
        nzFooter: null
      });
    });
  }

  public trackByAlarm(index: number, alarm: PersistedAlarm): string {
    return alarm.$key;
  }

  public trackByInventoryEntry(index: number, entry: { containerName: string, amount: number, hq: boolean }): string {
    return `${entry.containerName}${entry.hq}`;
  }
}
