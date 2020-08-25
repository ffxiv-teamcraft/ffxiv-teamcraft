import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';

@Component({
  selector: 'app-alarm-group',
  templateUrl: './alarm-group.component.html',
  styleUrls: ['./alarm-group.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmGroupComponent {

  public group$ = this.alarmsFacade.externalGroup$;

  public alarms$ = this.alarmsFacade.externalGroupAlarms$;

  public alarmGroups$ = this.alarmsFacade.allGroups$;

  constructor(route: ActivatedRoute, private alarmsFacade: AlarmsFacade) {
    route.paramMap.subscribe(paramMap => {
      this.alarmsFacade.loadExternalGroup(paramMap.get('key'));
    });
  }

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    alarm.groupId = group.$key;
    this.alarmsFacade.addAlarms(alarm);
  }

  cloneGroup(group: AlarmGroup, alarms: Alarm[]): void {
    this.alarmsFacade.addAlarmsAndGroup(alarms.map(a => {
      delete a.$key;
      return a;
    }), group.name);
  }

}
