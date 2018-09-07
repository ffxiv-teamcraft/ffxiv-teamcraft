import { Component, OnInit } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Observable } from 'rxjs/Observable';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';

@Component({
  selector: 'app-alarms-sidebar',
  templateUrl: './alarms-sidebar.component.html',
  styleUrls: ['./alarms-sidebar.component.less']
})
export class AlarmsSidebarComponent implements OnInit {

  public alarms$: Observable<AlarmDisplay[]>;

  public loaded$: Observable<boolean>;

  constructor(private alarmBell: AlarmBellService, private alarmsFacade: AlarmsFacade) {
    this.alarms$ = this.alarmBell.getAlarmsDisplay();
    this.loaded$ = this.alarmsFacade.loaded$;
  }

  trackByAlarm(index: number, display: AlarmDisplay): string {
    return display.alarm.$key;
  }

  ngOnInit(): void {
    this.alarmsFacade.loadAlarms();
  }

}
