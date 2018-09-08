import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-alarms-page',
  templateUrl: './alarms-page.component.html',
  styleUrls: ['./alarms-page.component.less']
})
export class AlarmsPageComponent implements OnInit {

  public alarms$: Observable<AlarmDisplay[]>;

  public loaded$: Observable<boolean>;

  constructor(private alarmBell: AlarmBellService, private alarmsFacade: AlarmsFacade,
              private _settings: SettingsService) {
  }

  public get settings():SettingsService{
    return this._settings;
  }

  trackByAlarm(index: number, display: AlarmDisplay): string {
    return display.alarm.$key;
  }

  deleteAlarm(alarm: Alarm): void {
    this.alarmsFacade.deleteAlarm(alarm);
  }

  ngOnInit(): void {
    this.alarms$ = this.alarmBell.getAlarmsDisplay();
    this.loaded$ = this.alarmsFacade.loaded$;
    this.alarmsFacade.loadAlarms();
  }

}
