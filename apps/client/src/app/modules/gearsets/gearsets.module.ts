import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromGearsets from './+state/gearsets.reducer';
import { GearsetsEffects } from './+state/gearsets.effects';
import { GearsetsFacade } from './+state/gearsets.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromGearsets.GEARSETS_FEATURE_KEY,
      fromGearsets.reducer
    ),
    EffectsModule.forFeature([GearsetsEffects])
  ],
  providers: [GearsetsFacade]
})
export class GearsetsModule {}
