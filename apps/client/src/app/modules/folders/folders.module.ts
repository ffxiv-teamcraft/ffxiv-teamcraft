import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromFolders from './+state/folders.reducer';
import { FoldersEffects } from './+state/folders.effects';
import { FoldersFacade } from './+state/folders.facade';
import { FolderComponent } from './folder/folder.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NzCollapseModule, NzModalModule } from 'ng-zorro-antd';
import { NameQuestionPopupModule } from '../name-question-popup/name-question-popup.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [FolderComponent],
  exports: [FolderComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromFolders.FOLDERS_FEATURE_KEY,
      fromFolders.reducer
    ),
    EffectsModule.forFeature([FoldersEffects]),

    NzCollapseModule,
    NzModalModule,

    TranslateModule,
    CoreModule,
    PipesModule,
    NameQuestionPopupModule,
    DragDropModule,
    FlexLayoutModule
  ],
  providers: [FoldersFacade]
})
export class FoldersModule {
}
