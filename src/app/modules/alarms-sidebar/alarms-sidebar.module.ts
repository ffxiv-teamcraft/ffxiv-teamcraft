import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlarmsSidebarComponent} from './alarms-sidebar/alarms-sidebar.component';
import {AlarmSidebarRowComponent} from './alarm-sidebar-row/alarm-sidebar-row.component';
import {CoreModule} from '../../core/core.module';
import {MatButtonModule, MatDialogModule, MatIconModule, MatListModule, MatTooltipModule} from '@angular/material';
import {CommonComponentsModule} from '../common-components/common-components.module';
import {PipesModule} from '../../pipes/pipes.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,

        CoreModule,

        MatListModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,

        CommonComponentsModule,
        PipesModule,
    ],
    declarations: [AlarmsSidebarComponent, AlarmSidebarRowComponent],
    exports: [AlarmsSidebarComponent]
})
export class AlarmsSidebarModule {
}
