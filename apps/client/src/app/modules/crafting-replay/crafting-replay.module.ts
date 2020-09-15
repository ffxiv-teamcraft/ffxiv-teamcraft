import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromCraftingReplay from './+state/crafting-replay.reducer';
import { CraftingReplayEffects } from './+state/crafting-replay.effects';
import { CraftingReplayFacade } from './+state/crafting-replay.facade';
import { ReplaySimulationComponent } from './replay-simulation/replay-simulation.component';
import { SimulatorModule } from '../../pages/simulator/simulator.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NzCardModule } from 'ng-zorro-antd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ReplaySimulationComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromCraftingReplay.CRAFTINGREPLAY_FEATURE_KEY,
      fromCraftingReplay.reducer
    ),
    EffectsModule.forFeature([CraftingReplayEffects]),
    SimulatorModule,
    PipesModule,
    NzCardModule,
    FlexLayoutModule,
    TranslateModule
  ],
  providers: [CraftingReplayFacade],
  exports: [
    ReplaySimulationComponent
  ]
})
export class CraftingReplayModule {
}
