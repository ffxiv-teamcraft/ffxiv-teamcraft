import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmGroupComponent } from './alarm-group/alarm-group.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from '../../modules/map/map.module';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { AlarmsSidebarModule } from '../../modules/alarms-sidebar/alarms-sidebar.module';
import { NgZorroAntdModule, NzAvatarModule, NzButtonModule, NzCardModule, NzGridModule, NzIconModule, NzToolTipModule } from 'ng-zorro-antd';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';
import { AlarmsOverlayComponent } from '../alarms-overlay/alarms-overlay/alarms-overlay.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ListModule } from '../../modules/list/list.module';


const routes: Routes = [
  {
    path: ':key',
    component: AlarmGroupComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [AlarmGroupComponent],
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
    NzCardModule,
    NzAvatarModule,
    ListModule,
    NzGridModule,
    NzToolTipModule,
    NzButtonModule,
    NzIconModule
  ]
})
export class AlarmGroupModule { }
