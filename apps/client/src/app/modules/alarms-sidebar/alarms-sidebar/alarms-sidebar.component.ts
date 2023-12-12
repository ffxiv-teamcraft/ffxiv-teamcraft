import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Observable } from 'rxjs';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { NzModalService } from 'ng-zorro-antd/modal';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { MapComponent } from '../../map/map/map.component';
import { SettingsService } from '../../settings/settings.service';
import { tap } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { HooksetActionIdPipe } from '../../../pipes/pipes/hookset-action-id.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../fullpage-message/fullpage-message/fullpage-message.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { RouterLink } from '@angular/router';
import { FishingBaitComponent } from '../../fishing-bait/fishing-bait/fishing-bait.component';
import { TimerTooltipDirective } from '../../../core/alarms/timer-tooltip.directive';
import { ItemNameClipboardDirective } from '../../../core/item-name-clipboard.directive';
import { GatheringItemUsesComponent } from '../../node-details/gathering-item-uses/gathering-item-uses.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-alarms-sidebar',
    templateUrl: './alarms-sidebar.component.html',
    styleUrls: ['./alarms-sidebar.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NzSwitchModule, FormsModule, NgFor, NzButtonModule, NzIconModule, NzToolTipModule, ItemIconComponent, NzWaveModule, GatheringItemUsesComponent, ItemNameClipboardDirective, TimerTooltipDirective, FishingBaitComponent, RouterLink, NzPopconfirmModule, NzDividerModule, FullpageMessageComponent, PageLoaderComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, TimerPipe, I18nRowPipe, ItemNamePipe, ActionIconPipe, NodeTypeIconPipe, ClosestAetherytePipe, XivapiIconPipe, LazyIconPipe, HooksetActionIdPipe, LazyRowPipe]
})
export class AlarmsSidebarComponent implements OnInit {

  public alarms$: Observable<AlarmDisplay[]> = this.alarmsFacade.alarmsSidebarDisplay$.pipe(
    tap(() => this.cd.detectChanges())
  );

  public loaded$ = this.alarmsFacade.loaded$;

  @Input()
  public overlayMode = false;

  constructor(private alarmBell: AlarmBellService, private alarmsFacade: AlarmsFacade,
              private dialog: NzModalService, public translate: TranslateService,
              private i18n: I18nToolsService, public settings: SettingsService,
              private cd: ChangeDetectorRef) {
  }

  trackByAlarm(index: number, display: AlarmDisplay): string {
    return display.alarm.$key;
  }

  markAsDone(alarm: PersistedAlarm): void {
    this.alarmsFacade.setAlarmDone(alarm.$key);
  }

  deleteAlarm(alarm: PersistedAlarm): void {
    this.alarmsFacade.deleteAlarm(alarm);
  }

  hideAlarm(alarm: PersistedAlarm): void {
    alarm.enabled = false;
    this.alarmsFacade.updateAlarm(alarm);
  }

  openMap(alarm: PersistedAlarm): void {
    this.i18n.getNameObservable('places', alarm.zoneId).subscribe(title => {
      this.dialog.create({
        nzTitle: title,
        nzContent: MapComponent,
        nzComponentParams: {
          mapId: alarm.mapId,
          markers: [alarm.coords]
        },
        nzFooter: null
      });
    });
  }

  ngOnInit(): void {
    this.alarmsFacade.loadAlarms();
  }

}
