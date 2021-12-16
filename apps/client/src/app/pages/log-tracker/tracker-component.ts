import { Alarm } from '../../core/alarms/alarm';
import { AlarmDisplay } from '../../core/alarms/alarm-display';
import { AlarmGroup } from '../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';
import { TeamcraftComponent } from '../../core/component/teamcraft-component';

export class TrackerComponent extends TeamcraftComponent {

  public alarmsLoaded$: Observable<boolean>;

  public alarms$: Observable<Alarm[]>;

  public alarmGroups$: Observable<AlarmGroup[]>;

  public alarmsCache: any = {};

  constructor(protected alarmsFacade: AlarmsFacade) {
    super();
    this.alarmsLoaded$ = this.alarmsFacade.loaded$;
    this.alarms$ = this.alarmsFacade.allAlarms$;
  }

  public toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  public addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }
}
