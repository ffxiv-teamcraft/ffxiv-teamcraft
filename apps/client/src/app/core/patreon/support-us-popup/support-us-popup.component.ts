import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
    selector: 'app-support-us-popup',
    templateUrl: './support-us-popup.component.html',
    styleUrls: ['./support-us-popup.component.less'],
    standalone: true,
    imports: [NzDividerModule, TranslateModule]
})
export class SupportUsPopupComponent {
}
