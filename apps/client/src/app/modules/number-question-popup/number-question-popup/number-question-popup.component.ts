import { Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-name-question-popup',
    templateUrl: './number-question-popup.component.html',
    styleUrls: ['./number-question-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NzInputNumberModule, FormsModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class NumberQuestionPopupComponent {

  @Input()
  value: number;

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close(this.value);
  }

}
