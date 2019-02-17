import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemsComponent } from './custom-items/custom-items.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';

const routes: Routes = [{
  path: '',
  component: CustomItemsComponent
}];

@NgModule({
  declarations: [CustomItemsComponent],
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    NgZorroAntdModule,
    FlexLayoutModule,
    NameQuestionPopupModule,

    RouterModule.forChild(routes)
  ]
})
export class CustomItemsModule {
}
