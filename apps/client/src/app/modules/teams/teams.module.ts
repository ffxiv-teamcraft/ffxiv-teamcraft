import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as teamsInitialState, teamsReducer } from './+state/teams.reducer';
import { TeamsEffects } from './+state/teams.effects';
import { TeamsFacade } from './+state/teams.facade';
import { CoreModule } from '../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { DatabaseModule } from '../../core/database/database.module';

@NgModule({
  imports: [
    CommonModule,

    CoreModule,
    TranslateModule,
    DatabaseModule,

    StoreModule.forFeature('teams', teamsReducer, {
      initialState: teamsInitialState
    }),
    EffectsModule.forFeature([TeamsEffects])
  ],
  declarations: []
})
export class TeamsModule {
}
