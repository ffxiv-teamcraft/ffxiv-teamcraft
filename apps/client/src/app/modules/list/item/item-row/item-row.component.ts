import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { getItemSource, ListRow } from '../../model/list-row';
import { ListsFacade } from '../../+state/lists.facade';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { Alarm } from '../../../../core/alarms/alarm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  switchMapTo,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { XivapiService } from '@xivapi/angular-client';
import { UserService } from '../../../../core/database/user.service';
import { AuthFacade } from '../../../../+state/auth.facade';
import { Team } from '../../../../model/team/team';
import { TeamsFacade } from '../../../teams/+state/teams.facade';
import { DiscordWebhookService } from '../../../../core/discord/discord-webhook.service';
import { CommentsPopupComponent } from '../../../comments/comments-popup/comments-popup.component';
import { CommentTargetType } from '../../../comments/comment-target-type';
import { List } from '../../model/list';
import { ListItemCommentNotification } from '../../../../model/notification/list-item-comment-notification';
import { RotationPickerService } from '../../../rotations/rotation-picker.service';
import { NumberQuestionPopupComponent } from '../../../number-question-popup/number-question-popup/number-question-popup.component';
import { ListManagerService } from '../../list-manager.service';
import { SettingsService } from '../../../settings/settings.service';
import { Craft } from '../../../../model/garland-tools/craft';
import { CommentsService } from '../../../comments/comments.service';
import { ListLayout } from '../../../../core/layout/list-layout';
import { CustomItem } from '../../../custom-items/model/custom-item';
import { ListPickerService } from '../../../list-picker/list-picker.service';
import * as _ from 'lodash';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { MacroPopupComponent } from '../../../../pages/simulator/components/macro-popup/macro-popup.component';
import { freeCompanyActions } from '../../../../core/data/sources/free-company-actions';
import { ConsumablesService } from '../../../../pages/simulator/model/consumables.service';
import { FreeCompanyActionsService } from '../../../../pages/simulator/model/free-company-actions.service';
import { MarketboardPopupComponent } from '../../../marketboard/marketboard-popup/marketboard-popup.component';
import { DataType } from '../../data/data-type';
import { RelationshipsComponent } from '../../../item-details/relationships/relationships.component';
import { SimulationService } from '../../../../core/simulation/simulation.service';
import { InventoryService } from '../../../inventory/inventory.service';
import { ListController } from '../../list-controller';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { TeamcraftOptimizedComponent } from '../../../../core/component/teamcraft-optimized-component';
import { ItemRowMenuElement } from '../../../../model/display/item-row-menu-element';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowComponent extends TeamcraftOptimizedComponent implements OnInit {

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
        item.sources = item.sources.map(source => {
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
    shareReplay({ bufferSize: 1, refCount: true })
  );

  buttonsCache = {};

  finalItem$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input()
  odd = false;

  @Input()
  overlay = false;

  moreAlarmsAvailable = 0;

  @Input()
  permissionLevel: PermissionLevel;

  @Input()
  alarmGroups: AlarmGroup[];

  @Input()
  skip?: number;

  userId$: Observable<string>;

  loggedIn$: Observable<boolean>;

  requiredForFinalCraft$: Observable<number>;

  team$: Observable<Team>;

  missingBooks$: Observable<number[]>;

  commentBadge$: Observable<boolean>;

  commentBadgeReloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

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

  ignoreRequirements$ = combineLatest([this.item$, this.list$, this.finalItem$]).pipe(
    map(([item, list, finalItem]) => {
      return ListController.shouldIgnoreRequirements(list, finalItem ? 'finalItems' : 'items', item.id);
    })
  );

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
    shareReplay({ bufferSize: 1, refCount: true })
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
      const alarms = getItemSource<Alarm[]>(item, DataType.ALARMS).sort((a, b) => {
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

  constructor(public listsFacade: ListsFacade, private alarmsFacade: AlarmsFacade,
              private messageService: NzMessageService, private translate: TranslateService,
              private modal: NzModalService,
              private i18n: I18nToolsService, private cdRef: ChangeDetectorRef,
              private userService: UserService, private xivapi: XivapiService,
              private authFacade: AuthFacade, private teamsFacade: TeamsFacade,
              private discordWebhookService: DiscordWebhookService,
              public settings: SettingsService,
              private listManager: ListManagerService,
              private rotationPicker: RotationPickerService,
              private commentsService: CommentsService,
              private listPicker: ListPickerService,
              private notificationService: NzNotificationService,
              public consumablesService: ConsumablesService,
              public freeCompanyActionsService: FreeCompanyActionsService,
              private inventoryService: InventoryService,
              private simulationService: SimulationService,
              private lazyData: LazyDataFacade, private etime: EorzeanTimeService,
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
    this.team$ = combineLatest([this.list$, this.teamsFacade.selectedTeam$]).pipe(
      map(([list, team]) => {
        if (list.teamId === undefined || (team && list.teamId !== team.$key)) {
          return null;
        }
        return team;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.requiredForFinalCraft$ = combineLatest([this.list$, this.item$]).pipe(
      map(([list, item]) => {
        return ListController.requiredAsHQ(list, item);
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

  _layout: ListLayout;

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

  public itemDoneChange$ = new Subject<number>();

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  private get registry() {
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

    this.commentBadge$ = this.commentBadgeReloader$.pipe(
      exhaustMap(() => combineLatest([this.list$, this.item$.pipe(map(i => i.id))])),
      switchMap(([list, itemId]) => {
        if (this.buttonsCache[ItemRowMenuElement.COMMENTS]) {
          return of([]);
        }
        return this.commentsService.getComments(
          CommentTargetType.LIST,
          list.$key,
          `${this.finalItem ? 'finalItems' : 'items'}:${itemId}`
        );
      }),
      map(comments => comments.length > 0),
      startWith(false)
    );
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

  attachRotation(item: ListRow): void {
    const entry = (<any>item).craftedBy[0];
    const craft: Partial<Craft> = {
      id: entry.recipeId,
      job: entry.jobId,
      lvl: entry.level,
      stars: entry.stars_tooltip.length,
      rlvl: entry.rlvl,
      durability: entry.durability,
      progress: entry.progression,
      quality: entry.quality
    };
    this.rotationPicker.pickRotation(item.id, craft.id, craft)
      .pipe(
        filter(rotation => rotation !== null)
      )
      .subscribe(rotation => {
        item.attachedRotation = rotation.$key;
        this.saveItem(item);
      });
  }

  detachRotation(item: ListRow): void {
    delete item.attachedRotation;
    this.saveItem(item);
  }

  openRotationMacroPopup(rotation: CraftingRotation, item: ListRow): void {
    combineLatest([
      this.lazyData.getEntry('foods'),
      this.lazyData.getEntry('medicines')
    ]).subscribe(([foods, medicines]) => {
      const foodsData = this.consumablesService.fromLazyData(foods);
      const medicinesData = this.consumablesService.fromLazyData(medicines);
      const freeCompanyActionsData = this.freeCompanyActionsService.fromData(freeCompanyActions);
      this.modal.create({
        nzContent: MacroPopupComponent,
        nzComponentParams: {
          rotation: this.registry.deserializeRotation(rotation.rotation),
          job: (<any>item).craftedBy[0].jobId,
          food: foodsData.find(f => rotation.food && f.itemId === rotation.food.id && f.hq === rotation.food.hq),
          medicine: medicinesData.find(m => rotation.medicine && m.itemId === rotation.medicine.id && m.hq === rotation.medicine.hq),
          freeCompanyActions: freeCompanyActionsData.filter(action => rotation.freeCompanyActions.indexOf(action.actionId) > -1)
        },
        nzTitle: this.translate.instant('SIMULATOR.Generate_ingame_macro'),
        nzFooter: null
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

  addTag(item: ListRow): void {
    this.authFacade.user$.pipe(
      first()
    ).subscribe(user => {
      if (this.newTag && !user.itemTags.some(entry => entry.id === item.id && entry.tag === this.newTag)) {
        user.itemTags.push({ id: item.id, tag: this.newTag });
      }
      this.authFacade.updateUser(user);
      this.newTag = '';
      this.tagInputVisible = false;
      this.tagInput$.next('');
    });
  }

  removeTag(tag: string, item: ListRow): void {
    this.authFacade.user$.pipe(
      first()
    ).subscribe(user => {
      user.itemTags = user.itemTags.filter(entry => entry.id !== item.id || entry.tag !== tag);
      this.authFacade.updateUser(user);
    });
  }

  checkMasterbooks(books: number[]): void {
    this.authFacade.saveMasterbooks(books.map(book => ({ id: book, checked: true })));
    setTimeout(() => {
      this.masterbooksReloader$.next(null);
    }, 500);
  }

  changeAmount(item: ListRow): void {
    this.modal.create({
      nzTitle: this.translate.instant('Edit_amount'),
      nzFooter: null,
      nzContent: NumberQuestionPopupComponent,
      nzComponentParams: {
        value: item.amount
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined),
        switchMap((amount) => {
          return this.listsFacade.selectedList$.pipe(
            first(),
            switchMap(list => {
              return this.listManager.addToList({
                itemId: item.id,
                list: list,
                recipeId: item.recipeId,
                amount: amount - item.amount

              });
            })
          );
        })
      )
      .subscribe((list) => {
        this.listsFacade.updateList(list, true);
      });
  }

  removeItem(item: ListRow): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.listManager.addToList({ itemId: item.id, list: list, recipeId: item.recipeId, amount: -item.amount });
      })
    ).subscribe((list) => {
      this.listsFacade.updateList(list, true);
    });
  }

  removeWorkingOnIt(userId: string, item: ListRow): void {
    item.workingOnIt = (item.workingOnIt || []).filter(u => u !== userId);
    this.saveItem(item);
  }

  setIgnoreRequirements(ignore: boolean, itemId: number, list: List, finalItem: boolean): void {
    ListController.setIgnoreRequirements(list, finalItem ? 'finalItems' : 'items', itemId, ignore);
    this.listManager.upgradeList(list).subscribe(l => {
      this.listsFacade.updateList(l);
    });
  }

  openCommentsPopup(isAuthor: boolean, item: ListRow): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.i18n.getNameObservable('items', item.id).pipe(
          switchMap(itemName => {
            return this.modal.create({
              nzTitle: `${itemName} - ${this.translate.instant('COMMENTS.Title')}`,
              nzFooter: null,
              nzContent: CommentsPopupComponent,
              nzComponentParams: {
                targetType: CommentTargetType.LIST,
                targetId: list.$key,
                targetDetails: `${this.finalItem ? 'finalItems' : 'items'}:${item.id}`,
                isAuthor: isAuthor,
                notificationFactory: (comment) => {
                  return new ListItemCommentNotification(list.$key, item.id, comment.content, list.name, list.authorId);
                }
              }
            }).afterClose;
          })
        );
      })
    ).subscribe(() => {
      this.commentBadgeReloader$.next(null);
    });
  }

  setWorkingOnIt(uid: string, item: ListRow): void {
    item.workingOnIt = item.workingOnIt || [];
    item.workingOnIt.push(uid);
    this.saveItem(item);
    this.listsFacade.selectedList$.pipe(
      first(),
      filter(list => list && list.teamId !== undefined),
      withLatestFrom(this.team$)
    ).subscribe(([list, team]) => {
      this.discordWebhookService.notifyUserAssignment(team, uid, item.id, list);
    });
  }

  saveItem(item: ListRow): void {
    this.listsFacade.updateItem(item, this.finalItem);
  }

  assignTeamMember(team: Team, memberId: string, item: ListRow): void {
    this.setWorkingOnIt(memberId, item);
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
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  success(key: string, args?: any): void {
    this.messageService.success(this.translate.instant(key, args));
  }

  addToList(item: ListRow): void {
    this.listPicker.addToList(item);
  }

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
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
        const alarmsToAdd = getItemSource<Alarm[]>(item, DataType.ALARMS).filter(a => {
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
          item: item,
          finalItem: this.finalItem
        },
        nzFooter: null
      });
    });
  }

  public trackByAlarm(index: number, alarm: Alarm): string {
    return alarm.$key;
  }

  public trackByInventoryEntry(index: number, entry: { containerName: string, amount: number, hq: boolean }): string {
    return `${entry.containerName}${entry.hq}`;
  }
}
