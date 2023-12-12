import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { ListRow } from '../../model/list-row';
import { ProcessedListAggregate } from '../../../list-aggregate/model/processed-list-aggregate';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SettingsService } from '../../../settings/settings.service';
import { InventoryService } from '../../../inventory/inventory.service';
import { ListsFacade } from '../../+state/lists.facade';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { PersistedAlarm } from '../../../../core/alarms/persisted-alarm';
import { AlarmsFacade } from '../../../../core/alarms/+state/alarms.facade';
import { DataType, getItemSource, ItemSource } from '@ffxiv-teamcraft/types';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { LayoutRow } from '../../../../core/layout/layout-row';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { CeilPipe } from '../../../../pipes/pipes/ceil.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { AlarmButtonComponent } from '../../../alarm-button/alarm-button/alarm-button.component';
import { CompactAmountInputComponent } from '../compact-amount-input/compact-amount-input.component';
import { ItemInventoryButtonComponent } from '../../item-inventory-button/item-inventory-button.component';
import { ItemSourcesDisplayComponent } from '../item-sources-display/item-sources-display.component';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { ItemNameClipboardDirective } from '../../../../core/item-name-clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemIconComponent } from '../../../item-icon/item-icon/item-icon.component';
import { NgIf, NgTemplateOutlet, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-compact-item-row',
    templateUrl: './compact-item-row.component.html',
    styleUrls: ['./compact-item-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, ItemIconComponent, NzToolTipModule, ItemNameClipboardDirective, I18nNameComponent, ItemSourcesDisplayComponent, ItemInventoryButtonComponent, CompactAmountInputComponent, NgTemplateOutlet, AlarmButtonComponent, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe, CeilPipe, XivapiIconPipe]
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

  hasItemInInventory$ = this.inventoryService.inventory$.pipe(
    map(inventory => inventory.hasItem(this.item.id))
  );

  public alarmDisplay$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    debounceTime(10),
    map((etime) => {
      const alarms = getItemSource<PersistedAlarm[]>(this.item, DataType.ALARMS).sort((a, b) => {
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
    return !this.done && this.item.canBeCrafted;
  }

  @HostBinding('class.can-skip')
  get canSkip(): boolean {
    return this.skip === this.item.amount;
  }

  @HostBinding('class.has-all-ingredients')
  get hasAllBaseIngredients(): boolean {
    return !this.done && this.item.hasAllBaseIngredients;
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
}
