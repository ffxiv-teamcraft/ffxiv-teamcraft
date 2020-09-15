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
import { NzButtonModule, NzCardModule, NzMessageModule, NzPopconfirmModule, NzToolTipModule, NzIconModule } from 'ng-zorro-antd';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { CraftingReplayRowComponent } from './crafting-replay-row/crafting-replay-row.component';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { CoreModule } from '../../core/core.module';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ReplaySimulationComponent, CraftingReplayRowComponent],
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
    NzButtonModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzMessageModule,
    NzIconModule,
    FlexLayoutModule,
    TranslateModule,
    ItemIconModule,
    ClipboardModule,
    CoreModule,
    RouterModule
  ],
  providers: [CraftingReplayFacade],
  exports: [
    ReplaySimulationComponent,
    CraftingReplayRowComponent
  ]
})
export class CraftingReplayModule {
}
