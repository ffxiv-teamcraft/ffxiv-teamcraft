import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromFolders from './+state/folders.reducer';
import { FoldersEffects } from './+state/folders.effects';
import { FoldersFacade } from './+state/folders.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromFolders.FOLDERS_FEATURE_KEY,
      fromFolders.reducer
    ),
    EffectsModule.forFeature([FoldersEffects])
  ],
  providers: [FoldersFacade]
})
export class FoldersModule {}
