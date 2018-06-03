import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlarmsComponent} from './alarms/alarms.component';
import {CoreModule} from '../../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import {AlarmCardComponent} from './alarm-card/alarm-card.component';
import {
    MatButtonModule, MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule, MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {AddAlarmPopupComponent} from './add-alarm-popup/add-alarm-popup.component';
import {FormsModule} from '@angular/forms';
import {TooltipModule} from '../../modules/tooltip/tooltip.module';
import {ListModule} from '../list/list.module';
import {MapModule} from '../../modules/map/map.module';
import {NgDragDropModule} from 'ng-drag-drop';

const routes: Routes = [{
    path: 'alarms',
    component: AlarmsComponent,
    canActivate: [MaintenanceGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        RouterModule.forChild(routes),
        TranslateModule,
        PipesModule,

        MatCardModule,
        MatGridListModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatListModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatExpansionModule,
        MatButtonToggleModule,

        MapModule,
        NgDragDropModule,

        CoreModule,
        CommonComponentsModule,
        TooltipModule,
        ListModule
    ],
    declarations: [
        AlarmsComponent,
        AlarmCardComponent,
        AddAlarmPopupComponent
    ],
    entryComponents: [
        AddAlarmPopupComponent
    ]
})
export class AlarmsModule {
}
