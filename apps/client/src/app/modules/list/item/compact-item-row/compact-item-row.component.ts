import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { getItemSource, ListRow } from '../../model/list-row';
import { ProcessedListAggregate } from '../../../list-aggregate/model/processed-list-aggregate';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { SettingsService } from '../../../settings/settings.service';
import { InventoryService } from '../../../inventory/inventory.service';
import { ListsFacade } from '../../+state/lists.facade';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { Alarm } from '../../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { DataType } from '../../data/data-type';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { LayoutRow } from '../../../../core/layout/layout-row';
import { ItemSource } from '../../model/item-source';

@Component({
  selector: 'app-compact-item-row',
  templateUrl: './compact-item-row.component.html',
  styleUrls: ['./compact-item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompactItemRowComponent extends TeamcraftComponent implements OnInit {
  @Input()
  permissionLevel: PermissionLevel;

  @Input()
  alarmGroups: AlarmGroup[];

  @Input()
  layoutRow: LayoutRow;

  @Input()
  skip?: number;

  @Input()
  item: ListRow;

  @Input()
  finalItem = false;

  @Input()
  aggregate?: ProcessedListAggregate;

  amountInInventory$: Observable<{ containerName: string, amount: number, hq: boolean, isRetainer: boolean }[]> =
    combineLatest(([this.settings.settingsChange$.pipe(startWith(0)), this.inventoryService.inventory$])).pipe(
      map(([, inventory]) => {
        return inventory.getItem(this.item.id)
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

  public alarmDisplay$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    debounceTime(10),
    map((etime) => {
      const alarms = getItemSource<Alarm[]>(this.item, DataType.ALARMS).sort((a, b) => {
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
      return {
        alarm: alarms[0],
        available: alarms.length - 1
      };
    })
  );

  public source: [ItemSource?];

  @HostBinding('class.done')
  get done(): boolean {
    return this.item.done >= this.item.amount;
  }

  @HostBinding('class.craftable')
  get craftable(): boolean {
    return this.item.canBeCrafted;
  }

  @HostBinding('class.can-skip')
  get canSkip(): boolean {
    return this.skip === this.item.amount;
  }

  @HostBinding('class.has-all-ingredients')
  get hasAllBaseIngredients(): boolean {
    return this.item.hasAllBaseIngredients;
  }


  constructor(public settings: SettingsService, private inventoryService: InventoryService,
              private listsFacade: ListsFacade, private alarmsFacade: AlarmsFacade,
              private etime: EorzeanTimeService) {
    super();
  }

  ngOnInit(): void {
    const source = this.getSource();
    this.source = source ? [source] : [];
  }

  private getSource(): ItemSource {
    if (!this.layoutRow || this.item.sources.length === 1) {
      return this.item.sources[0];
    }
    return this.item.sources.sort((a, b) => this.getSourceScore(b) - this.getSourceScore(a))[0];
  }

  private getSourceScore(source: ItemSource): number {
    return this.layoutRow.filter.matchingSources.includes(source.type) ? 1 : 0;
  }


  add(amount: string | number, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, +amount, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, +amount, item.recipeId, item.amount, external);
    }
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

  trackByInventoryEntry(index: number, entry: { containerName: string, amount: number, hq: boolean }): string {
    return `${entry.containerName}${entry.hq}`;
  }
}
