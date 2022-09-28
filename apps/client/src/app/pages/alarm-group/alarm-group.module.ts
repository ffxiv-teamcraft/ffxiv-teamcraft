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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ListModule } from '../../modules/list/list.module';
import { AlarmButtonModule } from '../../modules/alarm-button/alarm-button.module';


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
    NzIconModule,
    AlarmButtonModule
  ]
})
export class AlarmGroupModule {
}
