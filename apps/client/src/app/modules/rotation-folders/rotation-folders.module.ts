import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  initialState as rotationFoldersInitialState,
  ROTATIONFOLDERS_FEATURE_KEY,
  rotationFoldersReducer
} from './+state/rotation-folders.reducer';
import { RotationFoldersEffects } from './+state/rotation-folders.effects';
import { RotationFoldersFacade } from './+state/rotation-folders.facade';
import { CoreModule } from '../../core/core.module';
import { RotationsModule } from '../rotations/rotations.module';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { DatabaseModule } from '../../core/database/database.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    DatabaseModule,
    RotationsModule,
    NgxDnDModule,

    StoreModule.forFeature(
      ROTATIONFOLDERS_FEATURE_KEY,
      rotationFoldersReducer,
      { initialState: rotationFoldersInitialState }
    ),
    EffectsModule.forFeature([RotationFoldersEffects])
  ],
  providers: [RotationFoldersFacade]
})
export class RotationFoldersModule {
}
