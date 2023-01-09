import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { DirtyFacade } from './+state/dirty.facade';
import { DIRTY_FEATURE_KEY, dirtyInitialState, dirtyReducer } from './+state/dirty.reducer';
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
    StoreModule.forFeature(DIRTY_FEATURE_KEY, dirtyReducer, { initialState: dirtyInitialState })
  ]
})
export class DirtyModule {
}
