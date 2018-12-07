import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportComponent } from './import/import.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../../modules/list/list.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';

const routes: Routes = [
  {
    path: ':importString',
    component: ImportComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ListModule,
    NgZorroAntdModule
  ],
  declarations: [ImportComponent]
})
export class ImportModule {
}
