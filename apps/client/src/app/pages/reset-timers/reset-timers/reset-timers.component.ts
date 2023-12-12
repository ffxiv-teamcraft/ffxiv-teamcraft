import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RealtimeAlarmsService } from '../../../core/alarms/realtime-alarms.service';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TutorialStepDirective } from '../../../core/tutorial/tutorial-step.directive';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzListModule } from 'ng-zorro-antd/list';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-reset-timers',
    templateUrl: './reset-timers.component.html',
    styleUrls: ['./reset-timers.component.less'],
    standalone: true,
    imports: [NgIf, NzListModule, NgFor, NzSwitchModule, TutorialStepDirective, FormsModule, AsyncPipe, TranslateModule, TimerPipe]
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
