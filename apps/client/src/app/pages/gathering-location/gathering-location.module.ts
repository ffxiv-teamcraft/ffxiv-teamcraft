import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatheringLocationComponent } from './gathering-location/gathering-location.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '../../modules/map/map.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: GatheringLocationComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    FormsModule,

    RouterModule.forChild(routes),

    TranslateModule,

    MapModule,
    PipesModule,
    ItemIconModule,
    AlarmsModule,
    PageLoaderModule,
    FullpageMessageModule,
    FishingBaitModule,

    NgZorroAntdModule
  ],
  declarations: [GatheringLocationComponent]
})
export class GatheringLocationModule {
}
