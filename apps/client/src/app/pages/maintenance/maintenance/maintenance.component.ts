import { Component } from '@angular/core';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';

@Component({
    selector: 'app-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.less'],
    standalone: true,
    imports: [FullpageMessageComponent]
})
export class MaintenanceComponent {
}
