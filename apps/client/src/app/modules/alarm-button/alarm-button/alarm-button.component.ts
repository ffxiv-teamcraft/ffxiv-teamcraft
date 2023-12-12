import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { first } from 'rxjs/operators';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { MapComponent } from '../../map/map/map.component';
import { combineLatest } from 'rxjs';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { AlarmDisplayPipe } from '../../../core/alarms/alarm-display.pipe';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { TimerTooltipDirective } from '../../../core/alarms/timer-tooltip.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-alarm-button',
    templateUrl: './alarm-button.component.html',
    styleUrls: ['./alarm-button.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzButtonModule, TimerTooltipDirective, NzWaveModule, NzToolTipModule, I18nNameComponent, NzIconModule, NzDropDownModule, NzMenuModule, NgFor, AsyncPipe, AlarmDisplayPipe, I18nPipe, TranslateModule, TimerPipe, I18nRowPipe, NodeTypeIconPipe, ClosestAetherytePipe, XivapiIconPipe, LazyRowPipe]
})
export class AlarmButtonComponent {

  @Input()
  alarm: PersistedAlarm;

  @Input()
  alarmGroups: AlarmGroup[];

  @Output()
  toggleAlarm = new EventEmitter<AlarmDisplay>();

  @Output()
  addAlarmWithGroup = new EventEmitter<{ alarm: PersistedAlarm, group: AlarmGroup }>();

  @Input()
  showPosition = true;

  @Input()
  tooltipText?: string;

  @Input()
  useTimerTooltip: boolean;

  constructor(private dialog: NzModalService, private i18n: I18nToolsService) {
  }

  openMap(): void {
    combineLatest([
      this.i18n.getNameObservable('items', this.alarm.itemId),
      this.i18n.getMapName(this.alarm.mapId)
    ]).pipe(
      first()
    ).subscribe(([itemName, mapName]) => {
      this.dialog.create({
        nzTitle: `${itemName} - ${mapName}`,
        nzContent: MapComponent,
        nzComponentParams: {
          mapId: this.alarm.mapId,
          markers: [this.alarm.coords]
        },
        nzFooter: null
      });

    });
  }
}
