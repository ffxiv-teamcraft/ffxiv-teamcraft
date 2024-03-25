import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { DialogComponent } from '../../../core/dialog.component';

@Component({
  selector: 'app-text-question-popup',
  templateUrl: './text-question-popup.component.html',
  styleUrls: ['./text-question-popup.component.less'],
  standalone: true,
  imports: [FormsModule, NzInputModule, ReactiveFormsModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class TextQuestionPopupComponent extends DialogComponent implements OnInit {

  @Input()
  baseText = '';

  @Input()
  placeholder = '';

  public control: UntypedFormControl;

  constructor(private modalRef: NzModalRef) {
    super();
  }

  public submit(): void {
    this.modalRef.close(this.control.value);
  }

  ngOnInit(): void {
    this.patchData();
    this.control = new UntypedFormControl(this.baseText);
  }

}
