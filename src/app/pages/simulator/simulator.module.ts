import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SimulatorPageComponent} from './components/simulator-page/simulator-page.component';
import {SimulatorComponent} from './components/simulator/simulator.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {PipesModule} from '../../pipes/pipes.module';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTooltipModule,
} from '@angular/material';
import {ActionComponent} from './components/action/action.component';
import {CraftingActionsRegistry} from './model/crafting-actions-registry';
import {CoreModule} from 'app/core/core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SettingsModule} from 'app/pages/settings/settings.module';
import {TooltipModule} from '../../modules/tooltip/tooltip.module';
import {NgDragDropModule} from 'ng-drag-drop';
import {CustomSimulatorPageComponent} from './components/custom-simulator-page/custom-simulator-page.component';

const routes: Routes = [
    {
        path: 'simulator/custom',
        component: CustomSimulatorPageComponent
    },
    {
        path: 'simulator/:itemId',
        component: SimulatorPageComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),

        TranslateModule,
        NgDragDropModule,

        MatProgressBarModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatInputModule,
        MatListModule,
        MatTooltipModule,

        CommonComponentsModule,
        TooltipModule,
        PipesModule,
        CoreModule,
        SettingsModule,
    ],
    declarations: [
        CustomSimulatorPageComponent,
        SimulatorPageComponent,
        SimulatorComponent,
        ActionComponent
    ],
    providers: [
        CraftingActionsRegistry,
    ]
})
export class SimulatorModule {
}
