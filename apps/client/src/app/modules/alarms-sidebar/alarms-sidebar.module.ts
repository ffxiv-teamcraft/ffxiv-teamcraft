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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AntdSharedModule } from '../../core/antd-shared.module';

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
    AntdSharedModule
  ],
  declarations: [AlarmsSidebarComponent],
  exports: [AlarmsSidebarComponent]
})
export class AlarmsSidebarModule {
}
