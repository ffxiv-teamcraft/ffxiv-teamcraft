import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameQuestionPopupComponent } from './name-question-popup/name-question-popup.component';
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
  declarations: [NameQuestionPopupComponent],
  entryComponents: [NameQuestionPopupComponent]
})
export class NameQuestionPopupModule {
}
