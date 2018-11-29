import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberQuestionPopupComponent } from './number-question-popup/number-question-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    TranslateModule,

    NgZorroAntdModule
  ],
  declarations: [NumberQuestionPopupComponent],
  entryComponents: [NumberQuestionPopupComponent]
})
export class NumberQuestionPopupModule {
}
