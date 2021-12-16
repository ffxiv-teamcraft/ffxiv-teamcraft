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
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NameQuestionPopupModule } from '../name-question-popup/name-question-popup.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FolderPageComponent } from './folder-page/folder-page.component';
import { RouterModule } from '@angular/router';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { FullpageMessageModule } from '../fullpage-message/fullpage-message.module';
import { FavoritesModule } from '../favorites/favorites.module';

@NgModule({
  declarations: [FolderComponent, FolderPageComponent],
  exports: [FolderComponent, FolderPageComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromFolders.FOLDERS_FEATURE_KEY,
      fromFolders.reducer
    ),
    EffectsModule.forFeature([FoldersEffects]),

    NzCollapseModule,
    NzModalModule,
    NzButtonModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzIconModule,


    TranslateModule,
    CoreModule,
    PipesModule,
    NameQuestionPopupModule,
    DragDropModule,
    FlexLayoutModule,
    NzDividerModule,
    RouterModule,
    UserAvatarModule,
    FullpageMessageModule,
    FavoritesModule
  ],
  providers: [FoldersFacade]
})
export class FoldersModule {
}
