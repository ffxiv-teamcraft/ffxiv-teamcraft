import { Component, inject } from '@angular/core';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmsSidebarComponent } from '../../../modules/alarms-sidebar/alarms-sidebar/alarms-sidebar.component';
import { OverlayContainerComponent } from '../../../modules/overlay-container/overlay-container/overlay-container.component';

@Component({
    selector: 'app-alarms-overlay',
    templateUrl: './alarms-overlay.component.html',
    styleUrls: ['./alarms-overlay.component.less'],
    standalone: true,
    imports: [OverlayContainerComponent, AlarmsSidebarComponent]
})
export class AlarmsOverlayComponent {

  constructor() {
    const alarmsFacade = inject(AlarmsFacade);

    alarmsFacade.loadAlarms();
  }
}
