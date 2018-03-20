import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GatheringLocationComponent} from './gathering-location/gathering-location.component';
import {CoreModule} from '../../core/core.module';
import {
    MatButtonModule, MatCardModule,
    MatCheckboxModule,
    MatExpansionModule, MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTooltipModule
} from '@angular/material';
import {SettingsModule} from '../settings/settings.module';
import {PipesModule} from '../../pipes/pipes.module';
import {TooltipModule} from '../../modules/tooltip/tooltip.module';
import {FormsModule} from '@angular/forms';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {RouterModule} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {MapModule} from '../../modules/map/map.module';

const routes = [{
    path: 'gathering-location',
    component: GatheringLocationComponent,
    guards: [MaintenanceGuard],
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        RouterModule.forChild(routes),

        MatIconModule,
        MatExpansionModule,
        MatButtonModule,
        MatRadioModule,
        MatListModule,
        MatCheckboxModule,
        MatMenuModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatGridListModule,
        MatCardModule,

        CoreModule,
        SettingsModule,
        PipesModule,
        TooltipModule,
        CommonComponentsModule,
        MapModule,
    ],
    declarations: [
        GatheringLocationComponent,
    ]
})
export class GatheringLocationModule {
}
