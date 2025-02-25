import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsComponent } from './lists/lists.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';


import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { WorkshopModule } from '../../modules/workshop/workshop.module';
import { TeamsModule } from '../../modules/teams/teams.module';
import { MergeListsPopupComponent } from './merge-lists-popup/merge-lists-popup.component';
import { FormsModule } from '@angular/forms';
import { ListImportPopupComponent } from './list-import-popup/list-import-popup.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

import { DeleteMultipleListsPopupComponent } from './delete-multiple-lists-popup/delete-multiple-lists-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PipesModule } from '../../pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ListsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Lists'
    }
  }
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    CoreModule,
    ListModule,
    TeamsModule,
    WorkshopModule,
    FullpageMessageModule,
    ProgressPopupModule,
    TranslateModule,
    DragDropModule,
    RouterModule.forChild(routes),
    PipesModule,
    ListsComponent, MergeListsPopupComponent, ListImportPopupComponent, DeleteMultipleListsPopupComponent
]
})
export class ListsPageModule {
}
