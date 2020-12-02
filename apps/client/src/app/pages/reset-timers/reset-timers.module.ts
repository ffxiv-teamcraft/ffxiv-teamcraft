import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResetTimersComponent } from './reset-timers/reset-timers.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsModule } from '../../modules/settings/settings.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { AntdSharedModule } from '../../core/antd-shared.module';


const routes: Routes = [
  {
    path: '',
    component: ResetTimersComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [ResetTimersComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,

    RouterModule.forChild(routes),

    TranslateModule,

    SettingsModule,
    AntdSharedModule,
    PipesModule,
    CoreModule
  ]
})
export class ResetTimersModule {
}
