import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CUSTOM_LINKS_FEATURE_KEY, customLinksReducer, initialState } from './+state/custom-links.reducer';
import { CustomLinksEffects } from './+state/custom-links.effects';
import { CustomLinksComponent } from './custom-links/custom-links.component';
import { LinkComponent } from './link/link.component';
import { RouterModule, Routes } from '@angular/router';
import { CustomLinksFacade } from './+state/custom-links.facade';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { DatabaseModule } from '../../core/database/database.module';


const routes: Routes = [
  {
    path: 'link/nickName/:uri',
    component: LinkComponent
  },
  {
    path: 'custom-links',
    component: CustomLinksComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    NgZorroAntdModule,
    DatabaseModule,
    RouterModule.forChild(routes),

    StoreModule.forFeature(
      CUSTOM_LINKS_FEATURE_KEY,
      customLinksReducer,
      { initialState: initialState }
    ),
    EffectsModule.forFeature([CustomLinksEffects])
  ],
  providers: [
    CustomLinksFacade
  ],
  declarations: [CustomLinksComponent, LinkComponent],
  exports: [CustomLinksComponent, LinkComponent]
})
export class CustomLinksModule {
}
