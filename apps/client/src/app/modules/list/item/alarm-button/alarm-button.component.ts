import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Alarm } from '../../../../core/alarms/alarm';
import { AlarmDisplay } from '../../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../../core/alarms/alarm-group';

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
}
