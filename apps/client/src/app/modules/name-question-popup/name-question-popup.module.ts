import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameQuestionPopupComponent } from './name-question-popup/name-question-popup.component';
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
  declarations: [NameQuestionPopupComponent],
  entryComponents: [NameQuestionPopupComponent]
})
export class NameQuestionPopupModule {
}
