import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionDetailsComponent } from './commission-details/commission-details.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { CommissionsModule } from '../commissions/commissions.module';

const routes: Routes = [
  {
    path: ':key',
    component: CommissionDetailsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [CommissionDetailsComponent],
  imports: [
    CommonModule,
    CoreModule,

    CommissionsModule,

    RouterModule.forChild(routes)
  ]
})
export class CommissionModule {
}
