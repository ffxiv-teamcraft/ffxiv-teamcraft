import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { FlexModule } from '@angular/flex-layout/flex';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-rotation-tips-popup',
    templateUrl: './rotation-tips-popup.component.html',
    styleUrls: ['./rotation-tips-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzIconModule, NzDividerModule, TranslateModule]
})
export class RotationTipsPopupComponent {

  data = inject(NZ_MODAL_DATA);
}
