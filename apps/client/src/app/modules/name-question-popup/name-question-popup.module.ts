import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameQuestionPopupComponent } from './name-question-popup/name-question-popup.component';
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
  declarations: [NameQuestionPopupComponent]
})
export class NameQuestionPopupModule {
}
