import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Alarm } from '../../../core/alarms/alarm';
import { SettingsService } from '../../settings/settings.service';
import { AlarmsPageDisplay } from '../../../core/alarms/alarms-page-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-alarms-page',
  templateUrl: './alarms-page.component.html',
  styleUrls: ['./alarms-page.component.less']
})
export class AlarmsPageComponent implements OnInit {

  public display$: Observable<AlarmsPageDisplay>;

  public loaded$: Observable<boolean>;

  constructor(private alarmBell: AlarmBellService, private alarmsFacade: AlarmsFacade,
              private _settings: SettingsService, private dialog: NzModalService,
              private translate: TranslateService) {
  }

  public get settings(): SettingsService {
    return this._settings;
  }

  trackByAlarm(index: number, display: AlarmDisplay): string {
    return display.alarm.$key;
  }

  trackByGroup(index: number, group: AlarmGroup): string {
    return group.$key;
  }

  deleteAlarm(alarm: Alarm): void {
    this.alarmsFacade.deleteAlarm(alarm);
  }

  updateGroupMuteState(group: AlarmGroup): void {
    this.alarmsFacade.updateGroup(group);
  }

  setAlarmGroup(alarm: Alarm, groupKey: string | undefined): void {
    this.alarmsFacade.assignAlarmGroup(alarm, groupKey);
  }

  createGroup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('ALARMS.New_group'),
      nzFooter: null,
      nzContent: NameQuestionPopupComponent
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe((name) => {
      this.alarmsFacade.createGroup(name);
    });
  }

  ngOnInit(): void {
    this.display$ = this.alarmsFacade.alarmsPageDisplay$;
    this.loaded$ = this.alarmsFacade.loaded$;
    this.alarmsFacade.loadAlarms();
  }

}
