import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatreonRedirectComponent } from './patreon-redirect/patreon-redirect.component';
import { RouterModule, Routes } from '@angular/router';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AntdSharedModule } from '../../core/antd-shared.module';

const routes: Routes = [
  {
    path: '',
    component: PatreonRedirectComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [PatreonRedirectComponent],
  imports: [
    CommonModule,
    PageLoaderModule,
    AntdSharedModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ]
})
export class PatreonRedirectModule {
}
