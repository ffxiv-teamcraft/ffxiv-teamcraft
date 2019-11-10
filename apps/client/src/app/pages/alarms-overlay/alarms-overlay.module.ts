import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmsOverlayComponent } from './alarms-overlay/alarms-overlay.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from '../../modules/map/map.module';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AlarmsSidebarModule } from '../../modules/alarms-sidebar/alarms-sidebar.module';
import { FormsModule } from '@angular/forms';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';

const routes: Routes = [
  {
    path: '',
    component: AlarmsOverlayComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,

    RouterModule.forChild(routes),

    TranslateModule,

    MapModule,
    CoreModule,
    PipesModule,
    ItemIconModule,
    AlarmsModule,
    SettingsModule,
    PageLoaderModule,
    FullpageMessageModule,
    AlarmsSidebarModule,

    NgZorroAntdModule,
    OverlayContainerModule
  ],
  declarations: [AlarmsOverlayComponent],
})
export class AlarmsOverlayModule {
}
