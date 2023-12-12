import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-tutorial-popup',
    templateUrl: './tutorial-popup.component.html',
    styleUrls: ['./tutorial-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class TutorialPopupComponent {

  constructor(private modalRef: NzModalRef) {
  }

  public close(result: boolean): void {
    this.modalRef.close(result);
  }

}
