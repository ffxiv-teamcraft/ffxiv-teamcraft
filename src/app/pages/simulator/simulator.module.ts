import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SimulatorPageComponent} from './components/simulator-page/simulator-page.component';
import {SimulatorComponent} from './components/simulator/simulator.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {PipesModule} from '../../pipes/pipes.module';
import {ActionComponent} from './components/action/action.component';
import {CraftingActionsRegistry} from './model/crafting-actions-registry';
import {CoreModule} from 'app/core/core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SettingsModule} from 'app/pages/settings/settings.module';
import {TooltipModule} from '../../modules/tooltip/tooltip.module';
import {NgDragDropModule} from 'ng-drag-drop';
import {CustomSimulatorPageComponent} from './components/custom-simulator-page/custom-simulator-page.component';
import {RotationsPageComponent} from './components/rotations-page/rotations-page.component';
import {ImportRotationPopupComponent} from './components/import-rotation-popup/import-rotation-popup.component';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
} from '@angular/material';
import {MacroPopupComponent} from './components/macro-popup/macro-popup.component';
import {ClipboardModule} from 'ngx-clipboard';
import {CustomLinksModule} from '../custom-links/custom-links.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {SimulationMinStatsPopupComponent} from './components/simulation-min-stats-popup/simulation-min-stats-popup.component';
import {ImportMacroPopupComponent} from './components/import-macro-popup/import-macro-popup.component';
import {ConsumablesService} from './model/consumables.service';
import {RotationNamePopupComponent} from './components/rotation-name-popup/rotation-name-popup.component';
import {StepByStepReportPopupComponent} from './components/step-by-step-report-popup/step-by-step-report-popup.component';
import {RecipeChoicePopupComponent} from './components/recipe-choice-popup/recipe-choice-popup.component';
import {NewFolderPopupComponent} from './components/new-folder-popup/new-folder-popup.component';
import {RotationPanelComponent} from './components/rotation-panel/rotation-panel.component';

const routes: Routes = [
    {
        path: 'simulator/custom/:rotationId',
        component: CustomSimulatorPageComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'simulator/custom',
        component: CustomSimulatorPageComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'simulator/:itemId/:rotationId',
        component: SimulatorPageComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'simulator/:itemId/:recipeId/:rotationId',
        component: SimulatorPageComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'simulator/:itemId',
        component: SimulatorPageComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'rotations',
        component: RotationsPageComponent,
        canActivate: [MaintenanceGuard]
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
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTableModule,
        MatMenuModule,

        ClipboardModule,

        CommonComponentsModule,
        CustomLinksModule,
        TooltipModule,
        PipesModule,
        CoreModule,
        SettingsModule,
    ],
    declarations: [
        CustomSimulatorPageComponent,
        SimulatorPageComponent,
        SimulatorComponent,
        ActionComponent,
        RotationsPageComponent,
        ImportRotationPopupComponent,
        ImportMacroPopupComponent,
        MacroPopupComponent,
        SimulationMinStatsPopupComponent,
        RotationNamePopupComponent,
        StepByStepReportPopupComponent,
        RecipeChoicePopupComponent,
        NewFolderPopupComponent,
        RotationPanelComponent
    ],
    entryComponents: [
        ImportRotationPopupComponent,
        ImportMacroPopupComponent,
        MacroPopupComponent,
        SimulationMinStatsPopupComponent,
        RotationNamePopupComponent,
        StepByStepReportPopupComponent,
        RecipeChoicePopupComponent,
        NewFolderPopupComponent
    ],
    providers: [
        CraftingActionsRegistry,
        ConsumablesService
    ]
})
export class SimulatorModule {
}
