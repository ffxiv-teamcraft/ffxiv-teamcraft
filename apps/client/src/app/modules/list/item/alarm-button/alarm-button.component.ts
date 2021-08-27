import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Alarm } from '../../../../core/alarms/alarm';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';
import { MapComponent } from '../../../map/map/map.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalizedLazyDataService } from '../../../../core/data/localized-lazy-data.service';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-alarm-button',
  templateUrl: './alarm-button.component.html',
  styleUrls: ['./alarm-button.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmButtonComponent {

  @Input()
  alarm: Alarm;

  @Input()
  alarmGroups: AlarmGroup[];

  @Output()
  toggleAlarm = new EventEmitter<AlarmDisplay>();

  @Output()
  addAlarmWithGroup = new EventEmitter<{ alarm: Alarm, group: AlarmGroup }>();

  @Input()
  showPosition = true;

  constructor(private dialog: NzModalService, private l12n: LocalizedLazyDataService, private i18n: I18nToolsService) {
  }

  openMap(): void {
    this.i18n.resolveName(this.l12n.getItem(this.alarm.itemId)).pipe(
      first()
    ).subscribe(itemName => {
      this.dialog.create({
        nzTitle: itemName,
        nzContent: MapComponent,
        nzComponentParams: {
          mapId: this.alarm.mapId,
          markers: [this.alarm.coords]
        },
        nzFooter: null
      });

    });
  }
}
