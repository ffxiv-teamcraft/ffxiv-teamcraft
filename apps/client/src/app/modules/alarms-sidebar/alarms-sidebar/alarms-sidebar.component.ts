import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Observable } from 'rxjs';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { NzModalService } from 'ng-zorro-antd/modal';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { Alarm } from '../../../core/alarms/alarm';
import { MapComponent } from '../../map/map/map.component';
import { SettingsService } from '../../settings/settings.service';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-alarms-sidebar',
  templateUrl: './alarms-sidebar.component.html',
  styleUrls: ['./alarms-sidebar.component.less']
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

  deleteAlarm(alarm: Alarm): void {
    this.alarmsFacade.deleteAlarm(alarm);
  }

  hideAlarm(alarm: Alarm): void {
    alarm.enabled = false;
    this.alarmsFacade.updateAlarm(alarm);
  }

  openMap(alarm: Alarm): void {
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
