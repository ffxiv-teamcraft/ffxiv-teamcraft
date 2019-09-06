import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorPageComponent } from './components/simulator-page/simulator-page.component';
import { SimulatorComponent } from './components/simulator/simulator.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { ActionComponent } from './components/action/action.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { CustomSimulatorPageComponent } from './components/custom-simulator-page/custom-simulator-page.component';
import { RotationsPageComponent } from './components/rotations-page/rotations-page.component';
import { MacroPopupComponent } from './components/macro-popup/macro-popup.component';
import { ClipboardModule } from 'ngx-clipboard';
// import {CustomLinksModule} from '../custom-links/custom-links.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { SimulationMinStatsPopupComponent } from './components/simulation-min-stats-popup/simulation-min-stats-popup.component';
import { ConsumablesService } from './model/consumables.service';
import { FreeCompanyActionsService } from './model/free-company-actions.service';
import { RecipeChoicePopupComponent } from './components/recipe-choice-popup/recipe-choice-popup.component';
import { RotationPanelComponent } from './components/rotation-panel/rotation-panel.component';
import { CoreModule } from '../../core/core.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { RotationFolderPageComponent } from './components/rotation-folder-page/rotation-folder-page.component';
import { StepByStepReportComponent } from './components/step-by-step-report/step-by-step-report.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';
import { TextQuestionPopupModule } from '../../modules/text-question-popup/text-question-popup.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FavoritesModule } from '../../modules/favorites/favorites.module';
import { RotationFoldersModule } from '../../modules/rotation-folders/rotation-folders.module';
import { RotationFolderPanelComponent } from './components/rotation-folder-panel/rotation-folder-panel.component';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { CustomLinksModule } from '../../modules/custom-links/custom-links.module';
import { RotationTipsPopupComponent } from './components/rotation-tips-popup/rotation-tips-popup.component';
import { RotationTipsModule } from './rotation-tips/rotation-tips.module';
import { DirtyModule } from '../../core/dirty/dirty.module';
import { DirtyGuard } from '../../core/dirty/dirty-guard';
import { CommunityRotationsPageComponent } from './components/community-rotations-page/community-rotations-page.component';
import { CommunityRotationPopupComponent } from './components/community-rotation-popup/community-rotation-popup.component';
import { SolverPopupComponent } from './components/solver-popup/solver-popup.component';
import { SimulatorOpenerComponent } from './components/simulator-opener/simulator-opener.component';

const routes: Routes = [
  {
    path: 'simulator/custom/:rotationId',
    component: CustomSimulatorPageComponent,
    canActivate: [MaintenanceGuard],
    canDeactivate: [DirtyGuard]
  },
  {
    path: 'simulator',
    component: SimulatorOpenerComponent,
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'simulator/custom',
    component: CustomSimulatorPageComponent,
    canActivate: [MaintenanceGuard],
    canDeactivate: [DirtyGuard]
  },
  {
    path: 'simulator/:itemId/:recipeId',
    component: SimulatorPageComponent,
    canActivate: [MaintenanceGuard],
    canDeactivate: [DirtyGuard]
  },
  {
    path: 'simulator/:itemId/:recipeId/:rotationId',
    component: SimulatorPageComponent,
    canActivate: [MaintenanceGuard],
    canDeactivate: [DirtyGuard]
  },
  {
    path: 'simulator/:itemId',
    component: SimulatorPageComponent,
    canActivate: [MaintenanceGuard],
    canDeactivate: [DirtyGuard]
  },
  {
    path: 'rotations',
    component: RotationsPageComponent,
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'community-rotations',
    component: CommunityRotationsPageComponent,
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'rotation-folder/:folderId',
    component: RotationFolderPageComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,

    TranslateModule,
    ItemIconModule,
    NgxDnDModule,
    FullpageMessageModule,
    RotationsModule,
    RotationFoldersModule,
    NameQuestionPopupModule,
    TextQuestionPopupModule,
    PageLoaderModule,
    FavoritesModule,
    UserAvatarModule,
    CustomLinksModule,
    RotationTipsModule,

    NgZorroAntdModule,

    ClipboardModule,

    // CustomLinksModule,
    TooltipModule,
    PipesModule,
    CoreModule,
    SettingsModule,
    DirtyModule
  ],
  declarations: [
    CustomSimulatorPageComponent,
    SimulatorPageComponent,
    SimulatorComponent,
    ActionComponent,
    RotationsPageComponent,
    MacroPopupComponent,
    SimulationMinStatsPopupComponent,
    RecipeChoicePopupComponent,
    RotationPanelComponent,
    RotationFolderPageComponent,
    StepByStepReportComponent,
    RotationFolderPanelComponent,
    RotationTipsPopupComponent,
    CommunityRotationsPageComponent,
    CommunityRotationPopupComponent,
    SolverPopupComponent,
    SimulatorOpenerComponent
  ],
  exports: [
    RotationPanelComponent,
    RotationFolderPanelComponent,
    ActionComponent
  ],
  entryComponents: [
    MacroPopupComponent,
    SimulationMinStatsPopupComponent,
    RecipeChoicePopupComponent,
    StepByStepReportComponent,
    RotationTipsPopupComponent,
    CommunityRotationPopupComponent,
    SolverPopupComponent
  ],
  providers: [
    ConsumablesService,
    FreeCompanyActionsService
  ]
})
export class SimulatorModule {
}
