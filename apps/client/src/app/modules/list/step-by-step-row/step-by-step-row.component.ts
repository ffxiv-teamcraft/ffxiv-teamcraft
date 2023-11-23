import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { ListRow } from '../model/list-row';
import { ProcessedListAggregate } from '../../list-aggregate/model/processed-list-aggregate';
import { combineLatest, Subject } from 'rxjs';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { DataType, getItemSource } from '@ffxiv-teamcraft/types';
import { observeInput } from '../../../core/rxjs/observe-input';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { ListsFacade } from '../+state/lists.facade';
import { InventoryService } from '../../inventory/inventory.service';
import { List } from '../model/list';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { CeilPipe } from '../../../pipes/pipes/ceil.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { CompactAmountInputComponent } from '../item/compact-amount-input/compact-amount-input.component';
import { NgForTrackByIdDirective } from '../../../core/track-by/ng-for-track-by-id.directive';
import { ItemSourcesDisplayComponent } from '../item/item-sources-display/item-sources-display.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AlarmButtonComponent } from '../../alarm-button/alarm-button/alarm-button.component';
import { NgForTrackByKeyDirective } from '../../../core/track-by/ng-for-track-by-key.directive';
import { ItemInventoryButtonComponent } from '../item-inventory-button/item-inventory-button.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemNameClipboardDirective } from '../../../core/item-name-clipboard.directive';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-step-by-step-row',
    templateUrl: './step-by-step-row.component.html',
    styleUrls: ['./step-by-step-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzGridModule, NgIf, ItemIconComponent, I18nNameComponent, ItemNameClipboardDirective, NzToolTipModule, NzButtonModule, NzIconModule, ItemInventoryButtonComponent, NgFor, NgForTrackByKeyDirective, AlarmButtonComponent, NzTagModule, ItemSourcesDisplayComponent, NgForTrackByIdDirective, CompactAmountInputComponent, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe, CeilPipe, XivapiIconPipe, LazyIconPipe]
})
export class StepByStepRowComponent {
  @Input()
  row: ListRow;

  @Input()
  list: List;

  @Input()
  dataTypes: DataType[];

  @Input()
  aggregate?: ProcessedListAggregate;

  @Input()
  finalItem?: boolean;

  @Input()
  skip?: number;

  @Input()
  permissionLevel: PermissionLevel;

  @Input()
  showAlarms = false;

  @Input()
  showCrafts = false;

  row$ = observeInput(this, 'row');

  list$ = observeInput(this, 'list');

  masterbooks$ = this.row$.pipe(
    map(row => getItemSource(row, DataType.MASTERBOOKS))
  );

  public alarmsDisplay$ = combineLatest([
    this.row$,
    this.etime.getEorzeanTime().pipe(
      distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours())
    )
  ]).pipe(
    debounceTime(10),
    map(([item, etime]) => {
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
      if (!alarms || alarms.length < 6) {
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

  public alarmGroups$ = this.alarmsFacade.allGroups$;

  public hasItemInInventory$ = this.inventoryService.inventory$.pipe(
    map(inventory => inventory.hasItem(this.row.id)),
    shareReplay(1)
  );

  constructor(private alarmsFacade: AlarmsFacade, private etime: EorzeanTimeService, private listsFacade: ListsFacade,
              private inventoryService: InventoryService) {
  }

  @HostBinding('class.done')
  get done(): boolean {
    return this.row.done >= this.row.amount;
  }

  @HostBinding('class.craftable')
  get craftable(): boolean {
    return !this.done && this.row.canBeCrafted;
  }

  @HostBinding('class.can-skip')
  get canSkip(): boolean {
    return this.skip === this.row.amount;
  }

  @HostBinding('class.has-all-ingredients')
  get hasAllBaseIngredients(): boolean {
    return !this.craftable && this.row.hasAllBaseIngredients;
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

  add(amount: string | number, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, +amount, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone({
        itemId: item.id,
        itemIcon: item.icon,
        finalItem: this.finalItem,
        delta: +amount,
        recipeId: item.recipeId,
        totalNeeded: item.amount,
        external: external
      });
    }
    item.done += +amount;
  }
}
