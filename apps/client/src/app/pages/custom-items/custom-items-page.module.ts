import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemsComponent } from './custom-items/custom-items.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { CustomItemsModule } from '../../modules/custom-items/custom-items.module';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';

const routes: Routes = [{
  path: '',
  component: CustomItemsComponent
}];

@NgModule({
  declarations: [CustomItemsComponent],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    PipesModule,
    TranslateModule,
    NgZorroAntdModule,
    FlexLayoutModule,
    NameQuestionPopupModule,
    PageLoaderModule,
    FullpageMessageModule,
    NgxDnDModule,

    CustomItemsModule,
    RouterModule.forChild(routes)
  ]
})
export class CustomItemsPageModule {
}
