import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextQuestionPopupComponent } from './text-question-popup/text-question-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,

    NgZorroAntdModule
  ],
  declarations: [TextQuestionPopupComponent],
  entryComponents: [TextQuestionPopupComponent]
})
export class TextQuestionPopupModule {
}
