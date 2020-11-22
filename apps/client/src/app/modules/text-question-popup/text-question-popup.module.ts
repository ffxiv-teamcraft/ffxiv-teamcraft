import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextQuestionPopupComponent } from './text-question-popup/text-question-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,

    AntdSharedModule
  ],
  declarations: [TextQuestionPopupComponent]
})
export class TextQuestionPopupModule {
}
