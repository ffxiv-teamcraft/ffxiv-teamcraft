import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmsPageComponent } from './alarms-page/alarms-page.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from '../../modules/map/map.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AlarmsOptionsPopupComponent } from './alarms-options-popup/alarms-options-popup.component';

import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { CustomAlarmPopupModule } from '../../modules/custom-alarm-popup/custom-alarm-popup.module';

import { ListModule } from '../../modules/list/list.module';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NodeDetailsModule } from '../../modules/node-details/node-details.module';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

const routes: Routes = [
  {
    path: '',
    component: AlarmsPageComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    TranslateModule,
    MapModule,
    CoreModule,
    PipesModule,
    ItemIconModule,
    AlarmsModule,
    SettingsModule,
    FullpageMessageModule,
    FishingBaitModule,
    CustomAlarmPopupModule,
    // TODO migrate to cdk
    // NgDragDropModule,
    ListModule,
    NzAvatarModule,
    NzSliderModule,
    NodeDetailsModule,
    CdkDropList,
    CdkDrag,
    AlarmsPageComponent, AlarmsOptionsPopupComponent
]
})
export class AlarmsPageModule {
}
