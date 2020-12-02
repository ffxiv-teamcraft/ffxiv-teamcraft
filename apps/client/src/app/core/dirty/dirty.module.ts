import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DirtyFacade } from './+state/dirty.facade';
import { DIRTY_FEATURE_KEY, dirtyInitialState, dirtyReducer } from './+state/dirty.reducer';
import { DirtyEffects } from './+state/dirty.effects';
import { TranslateModule } from '@ngx-translate/core';
import { DirtyGuard } from './dirty-guard';
import { AntdSharedModule } from '../antd-shared.module';

@NgModule({
  providers: [
    DirtyFacade,
    TranslateModule,
    AntdSharedModule,
    DirtyGuard
  ],
  imports: [
    StoreModule.forFeature(DIRTY_FEATURE_KEY, dirtyReducer, { initialState: dirtyInitialState }),
    EffectsModule.forFeature([DirtyEffects])
  ]
})
export class DirtyModule {
}
