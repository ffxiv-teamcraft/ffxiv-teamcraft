import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberQuestionPopupComponent } from './number-question-popup/number-question-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    TranslateModule,

    AntdSharedModule
  ],
  declarations: [NumberQuestionPopupComponent]
})
export class NumberQuestionPopupModule {
}
