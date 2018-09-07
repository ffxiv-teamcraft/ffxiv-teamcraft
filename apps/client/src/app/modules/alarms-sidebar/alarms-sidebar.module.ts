import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmsSidebarComponent } from './alarms-sidebar/alarms-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../item-icon/item-icon.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    ItemIconModule,

    TranslateModule,

    NgZorroAntdModule,

    PipesModule
  ],
  declarations: [AlarmsSidebarComponent],
  exports: [AlarmsSidebarComponent]
})
export class AlarmsSidebarModule {
}
