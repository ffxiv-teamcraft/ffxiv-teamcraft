import { Component, OnInit } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { Observable } from 'rxjs/Observable';
import { AlarmBellService } from '../../../core/alarms/alarm-bell.service';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { NzModalService } from 'ng-zorro-antd';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { Alarm } from '../../../core/alarms/alarm';
import { MapComponent } from '../../map/map/map.component';

@Component({
  selector: 'app-alarms-sidebar',
  templateUrl: './alarms-sidebar.component.html',
  styleUrls: ['./alarms-sidebar.component.less']
})
export class AlarmsSidebarComponent implements OnInit {

  public alarms$: Observable<AlarmDisplay[]>;

  public loaded$: Observable<boolean>;

  constructor(private alarmBell: AlarmBellService, private alarmsFacade: AlarmsFacade,
              private dialog: NzModalService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService) {
  }

  trackByAlarm(index: number, display: AlarmDisplay): string {
    return display.alarm.$key;
  }

  openMap(alarm: Alarm): void {
    this.dialog.create({
      nzTitle: this.i18n.getName(this.l12n.getPlace(alarm.zoneId)),
      nzContent: MapComponent,
      nzComponentParams: {
        mapId: alarm.zoneId,
        markers: [alarm.coords]
      },
      nzFooter: null
    });
  }

  ngOnInit(): void {
    this.alarms$ = this.alarmsFacade.alarmsSidebarDisplay$;
    this.loaded$ = this.alarmsFacade.loaded$;
    this.alarmsFacade.loadAlarms();
  }

}
