import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromFishTrain from './fish-train/fish-train.reducer';
import { EffectsModule } from '@ngrx/effects';
import { FishTrainEffects } from './fish-train/fish-train.effects';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromFishTrain.fishTrainFeatureKey, fromFishTrain.reducer),
    EffectsModule.forFeature([FishTrainEffects])
  ]
})
export class FishTrainModule { }
