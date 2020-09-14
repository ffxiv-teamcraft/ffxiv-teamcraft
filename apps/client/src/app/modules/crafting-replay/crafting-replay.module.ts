import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromCraftingReplay from './+state/crafting-replay.reducer';
import { CraftingReplayEffects } from './+state/crafting-replay.effects';
import { CraftingReplayFacade } from './+state/crafting-replay.facade';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromCraftingReplay.CRAFTINGREPLAY_FEATURE_KEY,
      fromCraftingReplay.reducer
    ),
    EffectsModule.forFeature([CraftingReplayEffects]),
  ],
  providers: [CraftingReplayFacade],
})
export class CraftingReplayModule {}
