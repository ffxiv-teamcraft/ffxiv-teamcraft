import { Component } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';

@Component({
  selector: 'app-alarms-overlay',
  templateUrl: './alarms-overlay.component.html',
  styleUrls: ['./alarms-overlay.component.less']
})
export class AlarmsOverlayComponent {

  constructor(alarmsFacade: AlarmsFacade) {
    alarmsFacade.loadAlarms();
  }
}
