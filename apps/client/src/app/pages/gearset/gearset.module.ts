import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GearsetEditorComponent } from './gearset-editor/gearset-editor.component';
import { GearsetDisplayComponent } from './gearset-display/gearset-display.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ListModule } from '../../modules/list/list.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';

import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { MateriasPopupComponent } from './materias-popup/materias-popup.component';
import { GearsetsModule } from '../../modules/gearsets/gearsets.module';
import { MateriasNeededPopupComponent } from './materias-needed-popup/materias-needed-popup.component';
import { GearsetEditorRowComponent } from './gearset-editor-row/gearset-editor-row.component';
import { GearsetDisplaySlotComponent } from './gearset-display-slot/gearset-display-slot.component';

import { FavoritesModule } from '../../modules/favorites/favorites.module';
import { StatDisplayPipe } from './gearset-editor/stat-display.pipe';


const routes: Routes = [
  {
    path: ':setId',
    component: GearsetDisplayComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: ':setId/edit',
    component: GearsetEditorComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CoreModule,
    FlexLayoutModule,
    TooltipModule,
    ProgressPopupModule,
    FullpageMessageModule,
    GearsetsModule,
    ListModule,
    ListPickerModule,
    PipesModule,
    ItemIconModule,
    RouterModule.forChild(routes),
    FavoritesModule,
    GearsetEditorComponent, GearsetDisplayComponent, MateriasPopupComponent, MateriasNeededPopupComponent, GearsetEditorRowComponent, GearsetDisplaySlotComponent, StatDisplayPipe
]
})
export class GearsetModule {
}
