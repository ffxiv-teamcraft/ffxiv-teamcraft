import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemComponent } from './item.component';
import { CoreModule } from '../../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from '../../../modules/map/map.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { ItemIconModule } from '../../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../../core/alarms/alarms.module';
import { PageLoaderModule } from '../../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../../modules/fullpage-message/fullpage-message.module';
import { FishingBaitModule } from '../../../modules/fishing-bait/fishing-bait.module';
import { TooltipModule } from '../../../modules/tooltip/tooltip.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { MaintenanceGuard } from '../../maintenance/maintenance.guard';

const routes: Routes = [
  {
    path: ':itemId',
    component: ItemComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  declarations: [ItemComponent],
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
    TooltipModule,

    NgZorroAntdModule
  ]
})
export class ItemModule {
}
