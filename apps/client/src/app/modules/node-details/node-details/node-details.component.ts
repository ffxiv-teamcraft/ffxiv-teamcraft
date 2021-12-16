import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { OceanFishingTime } from '../../../pages/allagan-reports/model/ocean-fishing-time';

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailsComponent implements OnInit {

  OceanFishingTime = OceanFishingTime;

  alarmsLoaded$: Observable<boolean> = this.alarmsFacade.loaded$;

  alarms$: Observable<Alarm[]> = this.alarmsFacade.allAlarms$;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  @Input()
  showAlarmsIntegration = false;

  @Input()
  hideTimers = false;

  @Input()
  hideDbButton = false;

  public alarms: Alarm[] = [];

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

  public addAlarm(alarm: Alarm, group?: AlarmGroup): void {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  public canCreateAlarm(generatedAlarm: Partial<Alarm>): Observable<boolean> {
    return this.alarms$.pipe(
      map(alarms => {
        return !alarms.some(alarm => {
          return alarm.itemId === generatedAlarm.itemId
            && alarm.zoneId === generatedAlarm.zoneId
            && alarm.fishEyes === generatedAlarm.fishEyes
            && alarm.nodeId === generatedAlarm.nodeId;
        });
      })
    );
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

  trackByAlarm(index: number, alarm: Partial<Alarm>): string {
    return `${JSON.stringify(alarm.spawns)}:${JSON.stringify(alarm.weathers)}`;
  }

  ngOnInit(): void {
  }

}
