import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportUsComponent } from './support-us/support-us.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PipesModule } from '../../pipes/pipes.module';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    TranslateModule,
    ClipboardModule,
    PipesModule,
    NgZorroAntdModule,

    RouterModule.forChild(routes),
    FlexLayoutModule
  ]
})
export class SupportUsModule {
}
