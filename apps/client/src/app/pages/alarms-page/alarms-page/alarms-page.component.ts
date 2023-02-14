import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { SettingsService } from '../../../modules/settings/settings.service';
import { AlarmsPageDisplay } from '../../../core/alarms/alarms-page-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { AlarmGroupDisplay } from '../../../core/alarms/alarm-group-display';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { AlarmsOptionsPopupComponent } from '../alarms-options-popup/alarms-options-popup.component';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { CustomAlarmPopupComponent } from '../../../modules/custom-alarm-popup/custom-alarm-popup/custom-alarm-popup.component';
import { I18nName } from '@ffxiv-teamcraft/types';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { FolderAdditionPickerComponent } from '../../../modules/folder-addition-picker/folder-addition-picker/folder-addition-picker.component';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { groupBy } from 'lodash';
import { AdditionPickerEntry } from '../../../modules/folder-addition-picker/folder-addition-picker/addition-picker-entry';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';

@Component({
  selector: 'app-alarms-page',
  templateUrl: './alarms-page.component.html',
  styleUrls: ['./alarms-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmsPageComponent implements OnInit {

  public display$: Observable<AlarmsPageDisplay>;

  public loaded$: Observable<boolean>;

  public activePanels$ = new LocalStorageBehaviorSubject<Record<string, boolean>>('alarms:groups-collapse', {});

  constructor(private alarmBell: AlarmBellService, public alarmsFacade: AlarmsFacade,
              private _settings: SettingsService, private dialog: NzModalService,
              private translate: TranslateService,
              private i18n: I18nToolsService, private etime: EorzeanTimeService,
              private message: NzMessageService, private ipc: IpcService,
              public platform: PlatformService, private linkService: LinkToolsService) {
  }

  public get settings(): SettingsService {
    return this._settings;
  }

  public openOverlay(): void {
    this.ipc.openOverlay('/alarms-overlay', '/alarms-overlay');
  }

  trackByAlarm(index: number, display: AlarmDisplay): string {
    return (display.alarm as PersistedAlarm).$key;
  }

  trackByGroup(index: number, group: AlarmGroup): string {
    return group.$key;
  }

  deleteAlarm(alarm: PersistedAlarm): void {
    this.alarmsFacade.deleteAlarm(alarm);
  }

  updateGroupMuteState(group: AlarmGroup): void {
    this.alarmsFacade.updateGroup(group);
  }

  setAlarmGroup(alarm: PersistedAlarm, groupKey: string): void {
    this.alarmsFacade.assignAlarmGroup(alarm.$key, groupKey);
  }

  removeAlarmFromGroup(alarmKey: string, group: AlarmGroup): void {
    group.alarms = group.alarms.filter(key => key !== alarmKey);
    this.alarmsFacade.updateGroup(group);
  }

  addNote(alarm: PersistedAlarm): void {
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

  setPanelActive(key: string, active: boolean): void {
    this.activePanels$.next({
      ...this.activePanels$.value,
      [key]: active
    });
  }

  newCustomAlarm(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('ALARMS.CUSTOM.Title'),
      nzFooter: null,
      nzContent: CustomAlarmPopupComponent
    });
  }

  deleteAllAlarms(): void {
    this.alarmsFacade.deleteAllAlarms();
  }

  regenerateAlarms(): void {
    this.alarmsFacade.regenerateAlarms();
  }

  editNote(alarm: PersistedAlarm): void {
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

  getGroupLink(key: string): string {
    return this.linkService.getLink(`/alarm-group/${key}`);
  }

  deleteGroup(group: AlarmGroup): void {
    this.alarmsFacade.deleteGroup(group.$key);
  }

  deleteGroupAndAlarms(group: AlarmGroup, alarms: AlarmDisplay[]): void {
    this.alarmsFacade.deleteGroup(group.$key);
    alarms.map(alarm => alarm.alarm).forEach(alarm => this.deleteAlarm(alarm as PersistedAlarm));
  }

  getIngameAlarmMacro = (display: AlarmDisplay) => {
    const itemName$ = display.alarm.itemId ? this.i18n.getNameObservable('items', display.alarm.itemId) : of((display.alarm as PersistedAlarm).name);
    return itemName$.pipe(
      map(itemName => {
        const rp: I18nName = {
          en: 'rp',
          de: 'wh',
          fr: 'rp',
          ja: 'rp',
          ko: '반복'
        };
        return `/alarm "${itemName.slice(0, 10)}" et ${this.i18n.getName(rp)} ${display.nextSpawn.hours < 10 ? '0' : ''}${display.nextSpawn.hours}00 ${
          Math.ceil(this.etime.toEarthTime(this.settings.alarmHoursBefore * 60) / 60)}`;
      })
    );
  };

  private alarmToEntry(alarm: PersistedAlarm, groupName?: string): AdditionPickerEntry {
    const entry: AdditionPickerEntry = {
      $key: alarm.$key,
      name: of(''),
      description: groupName || this.translate.instant('ALARMS.No_folder')
    };
    if (alarm.itemId) {
      entry.name = this.i18n.getNameObservable('items', alarm.itemId);
    } else if (alarm.bnpcName) {
      entry.name = this.i18n.getNameObservable('mobs', alarm.bnpcName);
    } else {
      entry.name = of(alarm.name);
    }
    return entry;
  }

  addAlarmsToGroup(targetGroup: AlarmGroup): void {
    this.display$.pipe(
      first(),
      switchMap((display) => {
        return this.dialog.create({
          nzTitle: this.translate.instant('ALARMS.Add_alarms_to_group'),
          nzContent: FolderAdditionPickerComponent,
          nzComponentParams: {
            elements: [
              ...display.noGroup.map(({ alarm }) => {
                return this.alarmToEntry(alarm as PersistedAlarm);
              }),
              ...Object.values<AdditionPickerEntry[]>(
                groupBy<AdditionPickerEntry>([].concat.apply([], display.groupedAlarms.map(({ group, alarms }) => {
                  return alarms.map(({ alarm }) => {
                    return this.alarmToEntry(alarm as PersistedAlarm, group.name);
                  });
                })), '$key')
              ).map(entries => {
                return {
                  ...entries[0],
                  description: entries.map(entry => entry.description).join(', ')
                };
              })
            ]
          },
          nzFooter: null
        }).afterClose
          .pipe(
            filter(picked => !!picked)
          );
      })
    ).subscribe(alarms => {
      targetGroup.alarms.push(...alarms.map(a => a.$key));
      this.alarmsFacade.updateGroup(targetGroup);
    });
  }

  showSettings(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Timer_options'),
      nzFooter: null,
      nzContent: AlarmsOptionsPopupComponent
    });
  }

  ngOnInit(): void {
    this.display$ = this.alarmsFacade.alarmsPageDisplay$;
    this.loaded$ = this.alarmsFacade.loaded$;
    this.alarmsFacade.loadAlarms();
  }

  markAsDone(alarm: PersistedAlarm) {
    this.alarmsFacade.setAlarmDone(alarm.$key);
  }
}
