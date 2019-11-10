import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RotationOverlayComponent } from './rotation-overlay/rotation-overlay.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { SimulatorModule } from '../simulator/simulator.module';

const routes: Routes = [
  {
    path: ':rotationId',
    component: RotationOverlayComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [RotationOverlayComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,

    RouterModule.forChild(routes),

    TranslateModule,

    CoreModule,
    PipesModule,
    PageLoaderModule,
    SimulatorModule,
    FullpageMessageModule,

    NgZorroAntdModule,
    OverlayContainerModule
  ]
})
export class RotationOverlayModule {
}
