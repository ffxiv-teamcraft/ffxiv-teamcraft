import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsComponent } from './lists/lists.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';
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
import { AntdSharedModule } from '../../core/antd-shared.module';
import { DeleteMultipleListsPopupComponent } from './delete-multiple-lists-popup/delete-multiple-lists-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

const routes: Routes = [
  {
    path: '',
    component: ListsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
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
    PageLoaderModule,
    NameQuestionPopupModule,
    FullpageMessageModule,
    ProgressPopupModule,

    TranslateModule,
    AntdSharedModule,
    NgxDnDModule,
    DragDropModule,

    RouterModule.forChild(routes)
  ],
  declarations: [ListsComponent, MergeListsPopupComponent, ListImportPopupComponent, DeleteMultipleListsPopupComponent]
})
export class ListsPageModule {
}
