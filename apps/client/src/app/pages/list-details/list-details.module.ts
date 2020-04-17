import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDetailsComponent } from './list-details/list-details.component';
import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../core/layout/layout.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ListCrystalsPanelComponent } from './list-crystals-panel/list-crystals-panel.component';
import { FormsModule } from '@angular/forms';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { ClipboardModule } from 'ngx-clipboard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { IconsModule } from '../../core/icons/icons.module';
import { ListHistoryPopupComponent } from './list-history-popup/list-history-popup.component';
import { LayoutEditorModule } from '../../modules/layout-editor/layout-editor.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { MapModule } from '../../modules/map/map.module';
import { InventoryViewComponent } from './inventory-view/inventory-view.component';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { PermissionsModule } from '../../modules/permissions/permissions.module';
import { TotalPanelPricePopupComponent } from './total-panel-price-popup/total-panel-price-popup.component';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { TeamsModule } from '../../modules/teams/teams.module';
import { FavoritesModule } from '../../modules/favorites/favorites.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { PricingModule } from '../../modules/pricing/pricing.module';
import { NumberQuestionPopupModule } from '../../modules/number-question-popup/number-question-popup.module';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ItemPickerModule } from '../../modules/item-picker/item-picker.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { ListContributionsComponent } from './list-contributions/list-contributions.component';
import { InventorySynthesisPopupComponent } from './inventory-synthesis-popup/inventory-synthesis-popup.component';

const routes: Routes = [
  {
    path: ':listId',
    component: ListDetailsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,

    RouterModule.forChild(routes),

    CoreModule,
    ListModule,
    LayoutModule,
    TeamsModule,
    ItemIconModule,
    PipesModule,
    AlarmsModule,
    ClipboardModule,
    PageLoaderModule,
    FullpageMessageModule,
    LayoutEditorModule,
    ProgressPopupModule,
    MapModule,
    PermissionsModule,
    UserAvatarModule,
    FavoritesModule,
    MarketboardModule,
    PricingModule,
    NumberQuestionPopupModule,
    FishingBaitModule,
    ItemPickerModule,
    LayoutModule,
    ListPickerModule,
    TooltipModule,

    FlexLayoutModule,

    TranslateModule,
    NgZorroAntdModule
  ],
  declarations: [
    ListDetailsComponent,
    ListCrystalsPanelComponent,
    ListHistoryPopupComponent,
    InventoryViewComponent,
    TotalPanelPricePopupComponent,
    ListContributionsComponent,
    InventorySynthesisPopupComponent
  ]
})
export class ListDetailsModule {
}
