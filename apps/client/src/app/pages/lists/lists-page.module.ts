import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsComponent } from './lists/lists.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';

const routes: Routes = [
  {
    path: '',
    component: ListsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,

    CoreModule,
    ListModule,
    PageLoaderModule,
    NameQuestionPopupModule,

    TranslateModule,
    NgZorroAntdModule,
    NgxDnDModule,

    RouterModule.forChild(routes)
  ],
  declarations: [ListsComponent]
})
export class ListsPageModule {
}
