import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmsSidebarComponent } from './alarms-sidebar/alarms-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { MapModule } from '../map/map.module';
import { FullpageMessageModule } from '../fullpage-message/fullpage-message.module';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

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

    NgZorroAntdModule,

    PipesModule
  ],
  declarations: [AlarmsSidebarComponent],
  exports: [AlarmsSidebarComponent]
})
export class AlarmsSidebarModule {
}
