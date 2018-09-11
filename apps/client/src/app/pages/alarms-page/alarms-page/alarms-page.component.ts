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
import { AlarmGroupDisplay } from '../../../core/alarms/alarm-group-display';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/name-question-popup/text-question-popup.component';

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

  addNote(alarm: Alarm): void {
    this.dialog.create({
      nzTitle: this.translate.instant('ALARMS.Add_note'),
      nzFooter: null,
      nzContent: TextQuestionPopupComponent
    }).afterClose.pipe(
      filter(note => note !== undefined)
    ).subscribe((note) => {
      alarm.note = note;
      this.alarmsFacade.updateAlarm(alarm);
    });
  }

  editNote(alarm: Alarm): void {
    this.dialog.create({
      nzTitle: this.translate.instant('ALARMS.Edit_note'),
      nzFooter: null,
      nzContent: TextQuestionPopupComponent,
      nzComponentParams: { baseText: alarm.note }
    }).afterClose.pipe(
      filter(note => note !== undefined)
    ).subscribe((note) => {
      alarm.note = note;
      this.alarmsFacade.updateAlarm(alarm);
    });
  }

  setGroupIndex(index: number, group: AlarmGroup, groups: AlarmGroupDisplay[]): void {
    const orderedGroups = groups.map(groupDisplay => groupDisplay.group).filter(g => g.$key !== group.$key);
    orderedGroups.splice(index, 0, group);
    orderedGroups
      .map((g, i) => {
        g.index = i;
        return g;
      })
      .forEach(g => {
        this.alarmsFacade.updateGroup(g);
      });
  }

  createGroup(index: number): void {
    this.dialog.create({
      nzTitle: this.translate.instant('ALARMS.New_group'),
      nzFooter: null,
      nzContent: NameQuestionPopupComponent
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe((name) => {
      this.alarmsFacade.createGroup(name, index);
    });
  }

  renameGroup(group: AlarmGroup): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Please_enter_a_name'),
      nzFooter: null,
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: group.name }
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe((name) => {
      group.name = name;
      this.alarmsFacade.updateGroup(group);
    });
  }

  deleteGroup(group: AlarmGroup): void {
    this.alarmsFacade.deleteGroup(group.$key);
  }

  ngOnInit(): void {
    this.display$ = this.alarmsFacade.alarmsPageDisplay$;
    this.loaded$ = this.alarmsFacade.loaded$;
    this.alarmsFacade.loadAlarms();
  }

}
