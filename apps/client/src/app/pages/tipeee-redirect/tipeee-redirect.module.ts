import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipeeeRedirectComponent } from './patreon-redirect/tipeee-redirect.component';
import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';


const routes: Routes = [
  {
    path: '',
    component: TipeeeRedirectComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    TipeeeRedirectComponent
]
})
export class TipeeeRedirectModule {
}
