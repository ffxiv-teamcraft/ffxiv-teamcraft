import { Component } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-alarms-sidebar',
  templateUrl: './alarms-sidebar.component.html',
  styleUrls: ['./alarms-sidebar.component.less']
})
export class AlarmsSidebarComponent {

  public alarms$: Observable<Alarm[]>;

  constructor(private alarmsFacade: AlarmsFacade) {
    this.alarms$ = this.alarmsFacade.allAlarms$;
  }

}
