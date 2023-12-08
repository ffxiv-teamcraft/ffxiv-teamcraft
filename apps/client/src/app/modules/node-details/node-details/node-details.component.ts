import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { GatheringNode } from '@ffxiv-teamcraft/types';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { OceanFishingTime } from '../../../pages/allagan-reports/model/ocean-fishing-time';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmDetails } from '@ffxiv-teamcraft/types';
import { AlarmDisplayPipe } from '../../../core/alarms/alarm-display.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { WeatherIconPipe } from '../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AlarmButtonComponent } from '../../alarm-button/alarm-button/alarm-button.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';

@Component({
    selector: 'app-node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
  imports: [FlexModule, NgIf, NgSwitch, NgSwitchCase, DbButtonComponent, NgSwitchDefault, NzTagModule, NzToolTipModule, NgFor, AlarmButtonComponent, NzButtonModule, NzIconModule, AsyncPipe, DecimalPipe, TranslateModule, XivapiIconPipe, WeatherIconPipe, MapNamePipe, LazyRowPipe, I18nPipe, I18nRowPipe, AlarmDisplayPipe, I18nNameComponent, LazyIconPipe]
})
export class NodeDetailsComponent {

  OceanFishingTime = OceanFishingTime;

  alarms$: Observable<PersistedAlarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  @Input()
  showAlarmsIntegration = false;

  @Input()
  hideTimers = false;

  @Input()
  hideDbButton = false;

  public alarms: AlarmDetails[] = [];

  constructor(private alarmsFacade: AlarmsFacade, public translate: TranslateService) {
  }

  private _node: GatheringNode;

  get node(): GatheringNode {
    return this._node;
  }

  @Input()
  set node(node: GatheringNode) {
    this._node = node;
    if (node.limited) {
      this.alarms = this.alarmsFacade.generateAlarms(node);
    }
  }

  public toggleAlarm(display: AlarmDisplay, group?: AlarmGroup): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarmInGroup(display.alarm as PersistedAlarm, group);
    }
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

  trackByAlarm(index: number, alarm: Partial<PersistedAlarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

}
