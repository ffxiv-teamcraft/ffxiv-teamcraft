import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RealtimeAlarmsService } from '../../../core/alarms/realtime-alarms.service';

@Component({
  selector: 'app-reset-timers',
  templateUrl: './reset-timers.component.html',
  styleUrls: ['./reset-timers.component.less']
})
export class ResetTimersComponent {

  timers$: Observable<{ enabled: boolean, label: string, time: number }[]>;

  constructor(private realtimeAlarmsService: RealtimeAlarmsService) {
    this.timers$ = this.realtimeAlarmsService.getTimers();
  }

  public setEnabled(label: string, enabled: boolean) {
    let enabledAlarms = JSON.parse(localStorage.getItem('alarms:irl') || '[]');
    enabledAlarms = enabledAlarms.filter(alarmLabel => alarmLabel !== label);
    if (enabled) {
      enabledAlarms.push(label);
    }
    localStorage.setItem('alarms:irl', JSON.stringify(enabledAlarms));
  }

  trackByTimer(index: number): number {
    return index;
  }

}
