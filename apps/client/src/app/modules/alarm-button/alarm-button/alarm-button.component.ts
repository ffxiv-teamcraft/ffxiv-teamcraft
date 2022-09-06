import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { first } from 'rxjs/operators';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { MapComponent } from '../../map/map/map.component';

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

  constructor(private dialog: NzModalService, private i18n: I18nToolsService) {
  }

  openMap(): void {
    this.i18n.getNameObservable('items', this.alarm.itemId).pipe(
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
