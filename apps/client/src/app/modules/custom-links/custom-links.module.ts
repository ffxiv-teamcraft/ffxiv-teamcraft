import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CUSTOM_LINKS_FEATURE_KEY, customLinksReducer, initialState } from './+state/custom-links.reducer';
import { CustomLinksEffects } from './+state/custom-links.effects';
import { CustomLinksFacade } from './+state/custom-links.facade';
import { CoreModule } from '../../core/core.module';
import { DatabaseModule } from '../../core/database/database.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    DatabaseModule,
    TranslateModule,
    StoreModule.forFeature(CUSTOM_LINKS_FEATURE_KEY, customLinksReducer, { initialState: initialState }),
    EffectsModule.forFeature([CustomLinksEffects])
],
  providers: [
    CustomLinksFacade
  ]
})
export class CustomLinksModule {
}
