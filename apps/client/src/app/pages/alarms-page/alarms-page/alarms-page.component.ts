import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { SettingsService } from '../../../modules/settings/settings.service';
import { AlarmsPageDisplay } from '../../../core/alarms/alarms-page-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
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
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { HooksetActionIdPipe } from '../../../pipes/pipes/hookset-action-id.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { WeatherIconPipe } from '../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { MapComponent } from '../../../modules/map/map/map.component';
import { FishingBaitComponent } from '../../../modules/fishing-bait/fishing-bait/fishing-bait.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { TimerTooltipDirective } from '../../../core/alarms/timer-tooltip.directive';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { MapPositionComponent } from '../../../modules/map/map-position/map-position.component';
import { GatheringItemUsesComponent } from '../../../modules/node-details/gathering-item-uses/gathering-item-uses.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { TutorialStepDirective } from '../../../core/tutorial/tutorial-step.directive';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterLink } from '@angular/router';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgTemplateOutlet, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-alarms-page',
    templateUrl: './alarms-page.component.html',
    styleUrls: ['./alarms-page.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, NzButtonModule, NzToolTipModule, RouterLink, NzIconModule, NzWaveModule, TutorialStepDirective, NzPopconfirmModule, NzSwitchModule, FormsModule, NgTemplateOutlet, CdkDropList, NgFor, NzCollapseModule, CdkDrag, ClipboardDirective, NzDropDownModule, NzMenuModule, FullpageMessageComponent, PageLoaderComponent, NzCardModule, ItemIconComponent, NzAvatarModule, I18nNameComponent, GatheringItemUsesComponent, MapPositionComponent, DbButtonComponent, TimerTooltipDirective, NzPopoverModule, FishingBaitComponent, MapComponent, NzGridModule, AsyncPipe, TranslateModule, I18nPipe, TimerPipe, I18nRowPipe, ItemNamePipe, ActionIconPipe, ActionNamePipe, IfMobilePipe, NodeTypeIconPipe, ClosestAetherytePipe, XivapiIconPipe, WeatherIconPipe, LazyIconPipe, MapNamePipe, HooksetActionIdPipe, LazyRowPipe]
})
export class AlarmsPageComponent implements OnInit {

  public display$: Observable<AlarmsPageDisplay>;

  public loaded$: Observable<boolean>;

  public activePanels$ = new LocalStorageBehaviorSubject<Record<string, boolean>>('alarms:groups-collapse', {});

  constructor(public alarmsFacade: AlarmsFacade,
              private _settings: SettingsService, private dialog: NzModalService,
              private translate: TranslateService, private ipc: IpcService,
              private i18n: I18nToolsService, private etime: EorzeanTimeService,
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

  removeAlarmFromGroup(alarmKey: string, group: AlarmGroup): void {
    if (group) {
      group.alarms = group.alarms.filter(key => key !== alarmKey);
      this.alarmsFacade.updateGroup(group);
    }
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
    let itemName$ = this.i18n.getNameObservable('items', display.alarm.itemId);
    if (!display.alarm.itemId && display.alarm.name) {
      itemName$ = of((display.alarm as PersistedAlarm).name);
    }
    if (display.alarm.type === -10) {
      itemName$ = this.i18n.getNameObservable('mobs', display.alarm.bnpcName);
    }
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
