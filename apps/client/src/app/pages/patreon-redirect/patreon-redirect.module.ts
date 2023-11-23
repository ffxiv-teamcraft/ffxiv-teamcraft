import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatreonRedirectComponent } from './patreon-redirect/patreon-redirect.component';
import { RouterModule, Routes } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';


const routes: Routes = [
  {
    path: '',
    component: PatreonRedirectComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    PatreonRedirectComponent
]
})
export class PatreonRedirectModule {
}
