import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FishTrainComponent } from './fish-train/fish-train.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

const routes: Routes = [
  {
    path: ':id',
    component: FishTrainComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FishTrainRoutingModule {
}
