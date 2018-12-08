import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatreonRedirectComponent } from './patreon-redirect/patreon-redirect.component';
import { RouterModule, Routes } from '@angular/router';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: PatreonRedirectComponent
  }
];

@NgModule({
  declarations: [PatreonRedirectComponent],
  imports: [
    CommonModule,
    PageLoaderModule,
    NgZorroAntdModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ]
})
export class PatreonRedirectModule {
}
