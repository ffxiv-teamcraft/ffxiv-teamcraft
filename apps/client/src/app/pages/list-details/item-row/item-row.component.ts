import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Type } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Alarm } from '../../../core/alarms/alarm';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ItemDetailsPopup } from '../item-details/item-details-popup';
import { GatheredByComponent } from '../item-details/gathered-by/gathered-by.component';
import { filter, first, map, shareReplay, tap, withLatestFrom } from 'rxjs/operators';
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

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowComponent implements OnInit {

  private _item: ListRow;

  @Input()
  public set item(item: ListRow) {
    this._item = item;
    this.item$.next(item);
  }

  public get item(): ListRow {
    return this._item;
  }

  private item$: Subject<ListRow> = new Subject<ListRow>();

  @Input()
  finalItem = false;

  @Input()
  odd = false;

  canBeCrafted$: Observable<boolean>;

  hasAllBaseIngredients$: Observable<boolean>;

  permissionLevel$: Observable<PermissionLevel> = this.listsFacade.selectedListPermissionLevel$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  userId$: Observable<string>;

  loggedIn$: Observable<boolean>;

  requiredForFinalCraft$: Observable<number>;

  team$: Observable<Team>;

  constructor(public listsFacade: ListsFacade, private alarmsFacade: AlarmsFacade,
              private messageService: NzMessageService, private translate: TranslateService,
              private modal: NzModalService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private cdRef: ChangeDetectorRef,
              private userService: UserService, private xivapi: XivapiService,
              private authFacade: AuthFacade, private teamsFacade: TeamsFacade,
              private discordWebhookService: DiscordWebhookService,
              private rotationPicker: RotationPickerService) {
    this.canBeCrafted$ = this.listsFacade.selectedList$.pipe(
      tap(() => this.cdRef.detectChanges()),
      map(list => list.canBeCrafted(this.item)),
      shareReplay(1)
    );

    this.userId$ = this.authFacade.userId$;
    this.loggedIn$ = this.authFacade.loggedIn$;
    this.team$ = combineLatest(this.listsFacade.selectedList$, this.teamsFacade.selectedTeam$).pipe(
      map(([list, team]) => {
        if (list.teamId === undefined || list.teamId !== team.$key) {
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
          .filter(item => item.requires.find(req => req.id === this.item.id) !== undefined);
        if (this.item.requiredAsHQ) {
          return this.item.amount;
        }
        if (recipesNeedingItem.length === 0) {
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
  }

  removeWorkingOnIt(): void {
    delete this.item.workingOnIt;
    this.saveItem();
  }

  openCommentsPopup(list: List, isAuthor: boolean): void {
    this.modal.create({
      nzTitle: this.translate.instant('COMMENTS.Title'),
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
    if (team.webhook !== undefined) {
      this.listsFacade.selectedList$.pipe(first()).subscribe(list => {
        this.discordWebhookService.notifyUserAssignment(team, this.item.icon, memberId, this.item.id, list);
      });
    }
  }

  itemDoneChanged(newValue: number): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, newValue - this.item.done);
  }


  add(amount: string): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, +amount);
  }

  remove(amount: string): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, -1 * (+amount));
  }

  markAsDone(): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, this.item.amount - this.item.done);
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

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    alarm.groupId = group.$key;
    this.alarmsFacade.addAlarms(alarm);
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
      nzTitle: this.i18n.getName(this.l12n.getItem(this.item.id)),
      nzContent: component,
      nzComponentParams: { item: this.item },
      nzFooter: null
    });
  }
}
