import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { getItemSource, ListRow } from '../model/list-row';
import { ProcessedListAggregate } from '../../list-aggregate/model/processed-list-aggregate';
import { combineLatest, Subject } from 'rxjs';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { DataType } from '../data/data-type';
import { observeInput } from '../../../core/rxjs/observe-input';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { ListsFacade } from '../+state/lists.facade';
import { InventoryService } from '../../inventory/inventory.service';
import { List } from '../model/list';

@Component({
  selector: 'app-step-by-step-row',
  templateUrl: './step-by-step-row.component.html',
  styleUrls: ['./step-by-step-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  add(amount: string | number, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, +amount, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, +amount, item.recipeId, item.amount, external);
    }
    item.done += +amount;
  }
}
