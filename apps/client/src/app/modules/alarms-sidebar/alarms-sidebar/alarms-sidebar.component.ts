import { Component, OnInit } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-alarms-sidebar',
  templateUrl: './alarms-sidebar.component.html',
  styleUrls: ['./alarms-sidebar.component.less']
})
export class AlarmsSidebarComponent implements OnInit {

  public alarms$: Observable<Alarm[]>;

  constructor(private alarmsFacade: AlarmsFacade) {
    this.alarms$ = this.alarmsFacade.allAlarms$;
  }

  ngOnInit(): void {
    this.alarmsFacade.loadAlarms();
  }

}
