import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsComponent } from './metrics/metrics.component';
import { PlayerMetricsModule } from '../../modules/player-metrics/player-metrics.module';
import { RouterModule, Routes } from '@angular/router';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

const routes: Routes = [
  {
    path: '',
    component: MetricsComponent,
    canActivate: [VersionLockGuard]
  }
];

@NgModule({
  declarations: [
    MetricsComponent
  ],
  imports: [
    CommonModule,
    PlayerMetricsModule,

    RouterModule.forChild(routes)
  ]
})
export class MetricsModule {
}
