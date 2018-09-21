import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDetailsComponent } from './list-details/list-details.component';
import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':listId',
    component: ListDetailsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(routes),

    CoreModule,
    ListModule,

    TranslateModule,
    NgZorroAntdModule
  ],
  declarations: [ListDetailsComponent]
})
export class ListDetailsModule {
}
