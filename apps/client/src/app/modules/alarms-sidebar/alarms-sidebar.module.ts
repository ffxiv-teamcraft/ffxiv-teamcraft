import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmsSidebarComponent } from './alarms-sidebar/alarms-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { MapModule } from '../map/map.module';
import { FullpageMessageModule } from '../fullpage-message/fullpage-message.module';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { FishingBaitModule } from '../fishing-bait/fishing-bait.module';
import { NodeDetailsModule } from '../node-details/node-details.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    ItemIconModule,
    FlexLayoutModule,
    FormsModule,

    AlarmsModule,
    MapModule,

    FullpageMessageModule,
    PageLoaderModule,

    TranslateModule,

    PipesModule,
    AntdSharedModule,
    FishingBaitModule,
    NodeDetailsModule,
    RouterModule
  ],
  declarations: [AlarmsSidebarComponent],
  exports: [AlarmsSidebarComponent]
})
export class AlarmsSidebarModule {
}
