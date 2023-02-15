import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { GatheringNode } from '@ffxiv-teamcraft/types';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { OceanFishingTime } from '../../../pages/allagan-reports/model/ocean-fishing-time';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmDetails } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailsComponent {

  OceanFishingTime = OceanFishingTime;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

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
