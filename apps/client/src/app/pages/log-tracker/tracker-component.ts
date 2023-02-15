import { PersistedAlarm } from '../../core/alarms/persisted-alarm';
import { AlarmDisplay } from '../../core/alarms/alarm-display';
import { AlarmGroup } from '../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';
import { TeamcraftComponent } from '../../core/component/teamcraft-component';

export class TrackerComponent extends TeamcraftComponent {

  public alarmsLoaded$: Observable<boolean>;

  public alarms$: Observable<PersistedAlarm[]>;

  public alarmGroups$: Observable<AlarmGroup[]>;

  constructor(protected alarmsFacade: AlarmsFacade) {
    super();
    this.alarmsLoaded$ = this.alarmsFacade.loaded$;
    this.alarms$ = this.alarmsFacade.allAlarms$;
  }

  public toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm as PersistedAlarm);
    }
  }

  public addAlarmWithGroup(alarm: PersistedAlarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }
}
