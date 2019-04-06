import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { Alarm } from '../../../core/alarms/alarm';
import { NzMessageService, NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ItemDetailsPopup } from '../item-details/item-details-popup';
import { GatheredByComponent } from '../item-details/gathered-by/gathered-by.component';
import { filter, first, map, mergeMap, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { HuntingComponent } from '../item-details/hunting/hunting.component';
import { InstancesComponent } from '../item-details/instances/instances.component';
import { ReducedFromComponent } from '../item-details/reduced-from/reduced-from.component';
import { VendorsComponent } from '../item-details/vendors/vendors.component';
import { VenturesComponent } from '../item-details/ventures/ventures.component';
import { VoyagesComponent } from '../item-details/voyages/voyages.component';
import { TradesComponent } from '../item-details/trades/trades.component';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { XivapiService } from '@xivapi/angular-client';
import { UserService } from '../../../core/database/user.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { RelationshipsComponent } from '../item-details/relationships/relationships.component';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { CommentsPopupComponent } from '../../../modules/comments/comments-popup/comments-popup.component';
import { CommentTargetType } from '../../../modules/comments/comment-target-type';
import { List } from '../../../modules/list/model/list';
import { ListItemCommentNotification } from '../../../model/notification/list-item-comment-notification';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { NumberQuestionPopupComponent } from '../../../modules/number-question-popup/number-question-popup/number-question-popup.component';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Craft } from '../../../model/garland-tools/craft';
import { CommentsService } from '../../../modules/comments/comments.service';
import { ListLayout } from '../../../core/layout/list-layout';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ItemRowMenuElement } from '../../../model/display/item-row-menu-element';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowComponent implements OnInit {

  private _item: ListRow | CustomItem;

  @Input()
  public set item(item: ListRow | CustomItem) {
    this._item = item;
    this.handleAlarms(item);
    this.cdRef.detectChanges();
    this.item$.next(item);
  }

  public get item(): ListRow | CustomItem {
    return this._item;
  }

  private item$: Subject<ListRow> = new Subject<ListRow>();

  @Input()
  finalItem = false;

  @Input()
  odd = false;

  @Input()
  layout: ListLayout;

  alarms: Alarm[] = [];

  moreAlarmsAvailable = 0;

  canBeCrafted$: Observable<boolean>;

  craftableAmount$: Observable<number>;

  hasAllBaseIngredients$: Observable<boolean>;

  permissionLevel$: Observable<PermissionLevel> = this.listsFacade.selectedListPermissionLevel$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  userId$: Observable<string>;

  loggedIn$: Observable<boolean>;

  requiredForFinalCraft$: Observable<number>;

  team$: Observable<Team>;

  missingBooks$: Observable<number[]>;

  commentBadge$: Observable<boolean>;

  commentBadgeReloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  tagInputVisible = false;

  newTag: string;

  @ViewChild('inputElement') inputElement: ElementRef;

  itemTags$ = combineLatest(this.item$, this.authFacade.user$).pipe(
    map(([item, user]) => {
      return (user.itemTags || [])
        .filter(entry => entry.id === item.id)
        .map(entry => entry.tag);
    })
  );

  tagInput$ = new BehaviorSubject<string>('');

  availableTags$ = combineLatest(this.tagInput$, this.authFacade.user$).pipe(
    map(([input, user]) => {
      return user.itemTags
        .filter(entry => entry.tag.toLowerCase().indexOf(input.toLowerCase()) > -1)
        .map(entry => entry.tag);
    })
  );

  itemRowTypes = ItemRowMenuElement;

  constructor(public listsFacade: ListsFacade, private alarmsFacade: AlarmsFacade,
              private messageService: NzMessageService, private translate: TranslateService,
              private modal: NzModalService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private cdRef: ChangeDetectorRef,
              private userService: UserService, private xivapi: XivapiService,
              private authFacade: AuthFacade, private teamsFacade: TeamsFacade,
              private discordWebhookService: DiscordWebhookService,
              public settings: SettingsService,
              private listManager: ListManagerService,
              private rotationPicker: RotationPickerService,
              private commentsService: CommentsService,
              private listPicker: ListPickerService,
              private progressService: ProgressPopupService,
              private notificationService: NzNotificationService) {
    this.canBeCrafted$ = this.listsFacade.selectedList$.pipe(
      tap(() => this.cdRef.detectChanges()),
      filter(list => !list.notFound && list.canBeCrafted !== undefined),
      map(list => list.canBeCrafted(this.item)),
      shareReplay(1)
    );

    this.missingBooks$ = this.authFacade.mainCharacterEntry$.pipe(
      map(entry => {
        return (this.item.masterbooks || [])
        // Ignore string ids, as they are draft ids
          .filter(book => (<any>book.id.toString()) !== (<any>book.id))
          .filter(book => (entry.masterbooks || []).indexOf(book.id) === -1)
          .map(book => book.id);
      })
    );

    this.userId$ = this.authFacade.userId$;
    this.loggedIn$ = this.authFacade.loggedIn$;
    this.team$ = combineLatest(this.listsFacade.selectedList$, this.teamsFacade.selectedTeam$).pipe(
      map(([list, team]) => {
        if (list.teamId === undefined || (team && list.teamId !== team.$key)) {
          return null;
        }
        return team;
      }),
      shareReplay(1)
    );

    this.hasAllBaseIngredients$ = combineLatest(this.canBeCrafted$, this.listsFacade.selectedList$
      .pipe(
        map(list => list.hasAllBaseIngredients(this.item))
      )
    ).pipe(
      map(([craftable, allIngredients]) => !craftable && this.item.amount > this.item.done && allIngredients),
      shareReplay(1)
    );

    this.requiredForFinalCraft$ = this.listsFacade.selectedList$.pipe(
      map(list => {
        const recipesNeedingItem = list.finalItems
          .filter(item => item.requires !== undefined)
          .filter(item => item.requires.some(req => req.id === this.item.id));
        if (this.item.requiredAsHQ) {
          return this.item.amount;
        }
        if (list.disableHQSuggestions) {
          return 0;
        }
        if (recipesNeedingItem.length === 0 || this.item.requiredAsHQ === false) {
          return 0;
        } else {
          let count = 0;
          recipesNeedingItem.forEach(recipe => {
            count += recipe.requires.find(req => req.id === this.item.id).amount * recipe.amount;
          });
          return count;
        }
      })
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.cdRef.detectChanges();
    });

    this.craftableAmount$ = this.listsFacade.selectedList$.pipe(
      filter(() => this.layout.showCraftableAmount),
      tap(() => this.cdRef.detectChanges()),
      map(list => list.craftableAmount(this.item)),
      shareReplay(1)
    );

    this.commentBadge$ = this.commentBadgeReloader$.pipe(
      switchMap(() => this.listsFacade.selectedList$),
      switchMap((list) => {
        return this.commentsService.getComments(
          CommentTargetType.LIST,
          list.$key,
          `${this.finalItem ? 'finalItems' : 'items'}:${this.item.id}`
        );
      }),
      map(comments => comments.length > 0),
      startWith(false)
    );
  }

  showTagInput(): void {
    this.tagInputVisible = true;
    setTimeout(() => {
      this.inputElement.nativeElement.focus();
    }, 10);
  }

  addTag(): void {
    this.authFacade.user$.pipe(
      first()
    ).subscribe(user => {
      if (this.newTag && !user.itemTags.some(entry => entry.id === this.item.id && entry.tag === this.newTag)) {
        user.itemTags.push({ id: this.item.id, tag: this.newTag });
      }
      this.authFacade.updateUser(user);
      this.newTag = '';
      this.tagInputVisible = false;
      this.tagInput$.next('');
    });
  }

  removeTag(tag: string): void {
    this.authFacade.user$.pipe(
      first()
    ).subscribe(user => {
      user.itemTags = user.itemTags.filter(entry => entry.id !== this.item.id || entry.tag !== tag);
      this.authFacade.updateUser(user);
    });
  }

  checkMasterbooks(books: number[]): void {
    this.authFacade.saveMasterbooks(books.map(book => ({ id: book, checked: true })));
  }

  changeAmount(): void {
    this.modal.create({
      nzTitle: this.translate.instant('Edit_amount'),
      nzFooter: null,
      nzContent: NumberQuestionPopupComponent,
      nzComponentParams: {
        value: this.item.amount
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined),
        switchMap((amount) => {
          return this.listsFacade.selectedList$.pipe(
            first(),
            switchMap(list => {
              return this.listManager.addToList(this.item.id, list, this.item.recipeId, amount - this.item.amount);
            })
          );
        })
      )
      .subscribe((list) => {
        this.listsFacade.updateList(list, true);
      });
  }

  removeItem(): void {
    this.listsFacade.selectedList$.pipe(
      first(),
      switchMap(list => {
        return this.listManager.addToList(this.item.id, list, this.item.recipeId, -this.item.amount);
      })
    ).subscribe((list) => {
      this.listsFacade.updateList(list, true);
    });
  }

  removeWorkingOnIt(): void {
    delete this.item.workingOnIt;
    this.saveItem();
  }

  openCommentsPopup(list: List, isAuthor: boolean): void {
    this.modal.create({
      nzTitle: `${this.i18n.getName(this.l12n.getItem(this.item.id))} - ${this.translate.instant('COMMENTS.Title')}`,
      nzFooter: null,
      nzContent: CommentsPopupComponent,
      nzComponentParams: {
        targetType: CommentTargetType.LIST,
        targetId: list.$key,
        targetDetails: `${this.finalItem ? 'finalItems' : 'items'}:${this.item.id}`,
        isAuthor: isAuthor,
        notificationFactory: (comment) => {
          return new ListItemCommentNotification(list.$key, this.item.id, comment.content, list.name, list.authorId);
        }
      }
    }).afterClose.subscribe(() => {
      this.commentBadgeReloader$.next(null);
    });
  }

  setWorkingOnIt(uid: string): void {
    this.item.workingOnIt = uid;
    this.saveItem();
    this.listsFacade.selectedList$.pipe(
      first(),
      filter(list => list && list.teamId !== undefined),
      withLatestFrom(this.team$)
    ).subscribe(([list, team]) => {
      this.discordWebhookService.notifyUserAssignment(team, this.item.icon, uid, this.item.id, list);
    });
  }

  private saveItem(): void {
    this.listsFacade.updateItem(this.item, this.finalItem);
  }

  assignTeamMember(team: Team, memberId: string): void {
    this.setWorkingOnIt(memberId);
  }

  itemDoneChanged(newValue: number): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, newValue - this.item.done, this.item.recipeId);
  }


  add(amount: string): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, +amount, this.item.recipeId);
  }

  remove(amount: string): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, -1 * (+amount), this.item.recipeId);
  }

  markAsDone(): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, this.item.amount - this.item.done, this.item.recipeId);
  }

  resetDone(): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, -1 * this.item.done, this.item.recipeId);
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
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operation = this.listManager.addToList(item.id, list,
          item.recipeId ? item.recipeId : '', item.amount);
        return this.progressService.showProgress(operation,
          1,
          'Adding_recipes',
          { amount: 1, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest(this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.notificationService.success(
        this.translate.instant('Success'),
        this.translate.instant('Recipe_Added', { listname: list.name })
      );
    });
  }


  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    alarm.groupId = group.$key;
    this.alarmsFacade.addAlarms(alarm);
  }

  private handleAlarms(item: ListRow): void {
    // We don't want to display more than 6 alarms, else it becomes a large shitfest
    if (!item.alarms || item.alarms.length < 8) {
      this.alarms = item.alarms;
    } else {
      this.alarms = item.alarms.slice(0, 8);
      this.moreAlarmsAvailable = item.alarms.length - 8;
    }
  }

  addAllAlarms() {
    this.alarmsFacade.addAlarmsAndGroup(this.item.alarms, this.i18n.getName(this.l12n.getItem(this.item.id)));
  }

  public openGatheredByPopup(): void {
    this.openDetailsPopup(GatheredByComponent);
  }

  public openHuntingPopup(): void {
    this.openDetailsPopup(HuntingComponent);
  }

  public openInstancesPopup(): void {
    this.openDetailsPopup(InstancesComponent);
  }

  public openReducedFromPopup(): void {
    this.openDetailsPopup(ReducedFromComponent);
  }

  public openVendorsPopup(): void {
    this.openDetailsPopup(VendorsComponent);
  }

  public openVenturesPopup(): void {
    this.openDetailsPopup(VenturesComponent);
  }

  public openVoyagesPopup(): void {
    this.openDetailsPopup(VoyagesComponent);
  }

  public openTradesPopup(): void {
    this.openDetailsPopup(TradesComponent);
  }

  public openRequirementsPopup(): void {
    this.openDetailsPopup(RelationshipsComponent);
  }

  public openSimulator(recipeId: string): void {
    this.rotationPicker.openInSimulator(this.item.id, recipeId);
  }

  private openDetailsPopup(component: Type<ItemDetailsPopup>): void {
    this.modal.create({
      nzTitle: this.i18n.getName(this.l12n.getItem(this.item.id), this.item as CustomItem),
      nzContent: component,
      nzComponentParams: { item: this.item },
      nzFooter: null
    });
  }

  public isButton(element: ItemRowMenuElement): boolean {
    return this.layout && this.layout.rowsDisplay.buttons.indexOf(element) > -1;
  }

  public trackByCraft(index: number, craft: Craft): string {
    return craft.id;
  }

  public trackByAlarm(index: number, alarm: Alarm): string {
    return alarm.$key;
  }
}
