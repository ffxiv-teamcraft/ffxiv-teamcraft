import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ltr } from 'semver';

@Component({
  selector: 'app-alarm-group',
  templateUrl: './alarm-group.component.html',
  styleUrls: ['./alarm-group.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmGroupComponent {

  public group$ = this.alarmsFacade.externalGroup$;

  public outdated$ = this.group$.pipe(
    map(group => {
      return !group.notFound && ltr(group.appVersion, '8.0.0');
    })
  );

  public alarms$ = this.alarmsFacade.externalGroupAlarms$.pipe(
    distinctUntilChanged()
  );

  public alarmGroups$ = this.alarmsFacade.allGroups$;

  public addingGroupAndAlarms = false;

  constructor(route: ActivatedRoute, private alarmsFacade: AlarmsFacade,
              private router: Router) {
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
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  cloneGroup(group: AlarmGroup, alarms: Alarm[]): void {
    this.addingGroupAndAlarms = true;
    this.alarmsFacade.addAlarmsAndGroup(alarms.map(a => {
      delete a.$key;
      return a;
    }), group.name, true);
  }

}
