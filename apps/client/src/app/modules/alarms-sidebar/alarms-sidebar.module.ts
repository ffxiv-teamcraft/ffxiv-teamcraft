import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmsSidebarComponent } from './alarms-sidebar/alarms-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,

    TranslateModule,

    NgZorroAntdModule,

    PipesModule
  ],
  declarations: [AlarmsSidebarComponent],
  exports: [AlarmsSidebarComponent]
})
export class AlarmsSidebarModule {
}
