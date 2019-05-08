import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DbComponent } from './db/db.component';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from '../../modules/map/map.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { ListModule } from '../../modules/list/list.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { ItemDetailsPopupsModule } from '../list-details/item-details/item-details-popups.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ItemComponent } from './item/item.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { InstanceComponent } from './instance/instance.component';

const routes: Routes = [

  {
    path: ':language',
    component: DbComponent,
    children: [
      {
        path: 'item/:itemId',
        component: ItemComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'item/:itemId/:slug',
        component: ItemComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'instance/:instanceId',
        component: InstanceComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'instance/:instanceId/:slug',
        component: InstanceComponent,
        canActivate: [MaintenanceGuard]
      }
    ]
  }
];

@NgModule({
  declarations: [DbComponent, InstanceComponent, ItemComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),

    CoreModule,
    FlexLayoutModule,
    FormsModule,

    TranslateModule,

    MapModule,
    PipesModule,
    ItemIconModule,
    AlarmsModule,
    PageLoaderModule,
    FullpageMessageModule,
    FishingBaitModule,
    TooltipModule,
    ListModule,
    RotationsModule,
    ItemDetailsPopupsModule,

    NgZorroAntdModule
  ]
})
export class DbModule {
}
