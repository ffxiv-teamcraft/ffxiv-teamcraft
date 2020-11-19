import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportUsComponent } from './support-us/support-us.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreModule } from '../../core/core.module';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: SupportUsComponent
  }
];

@NgModule({
  declarations: [SupportUsComponent],
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,

    PipesModule,
    AntdSharedModule,

    RouterModule.forChild(routes),
    FlexLayoutModule
  ]
})
export class SupportUsModule {
}
