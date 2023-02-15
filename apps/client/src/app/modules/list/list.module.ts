import { NgModule } from '@angular/core';
import { CoreModule } from '../../core/core.module';
import { DatabaseModule } from '../../core/database/database.module';
import { ListPanelComponent } from './list-panel/list-panel.component';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';
import { NameQuestionPopupModule } from '../name-question-popup/name-question-popup.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TagsPopupComponent } from './tags-popup/tags-popup.component';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { TeamsModule } from '../teams/teams.module';
import { CommentsModule } from '../comments/comments.module';
import { CustomLinksModule } from '../custom-links/custom-links.module';
import { ListCompletionPopupComponent } from './list-completion-popup/list-completion-popup.component';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { ProgressPopupModule } from '../progress-popup/progress-popup.module';
import { ListDetailsPanelComponent } from './list-details-panel/list-details-panel.component';
import { ItemRowComponent } from './item/item-row/item-row.component';
import { MarketboardModule } from '../marketboard/marketboard.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { MapModule } from '../map/map.module';
import { ItemDetailsPopupsModule } from '../item-details/item-details-popups.module';
import { ItemSourcesDisplayComponent } from './item/item-sources-display/item-sources-display.component';
import { ItemRowButtonsComponent } from './item/item-row-buttons/item-row-buttons.component';
import { ListProgressbarComponent } from './list-progressbar/list-progressbar.component';
import { LazyScrollModule } from '../lazy-scroll/lazy-scroll.module';
import { ListSplitPopupComponent } from './list-split-popup/list-split-popup.component';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { ItemPickerModule } from '../item-picker/item-picker.module';
import { SimulatorModule } from '../../pages/simulator/simulator.module';
import { CompanyWorkshopTreeModule } from '../company-workshop-tree/company-workshop-tree.module';
import { InventoryModule } from '../inventory/inventory.module';
import { HttpClientModule } from '@angular/common/http';
import { ItemRowMenuComponent } from './item/item-row-menu/item-row-menu.component';
import { AggregateItemRowComponent } from './item/aggregate-item-row/aggregate-item-row.component';
import { AlarmButtonModule } from '../alarm-button/alarm-button.module';
import { CompactItemRowComponent } from './item/compact-item-row/compact-item-row.component';
import { StepByStepDetailsComponent } from './step-by-step-details/step-by-step-details.component';
import { StepByStepDatatypeComponent } from './step-by-step-datatype/step-by-step-datatype.component';
import { StepByStepRowComponent } from './step-by-step-row/step-by-step-row.component';
import { CompactAmountInputComponent } from './item/compact-amount-input/compact-amount-input.component';
import { ItemInventoryButtonComponent } from './item-inventory-button/item-inventory-button.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,

    DatabaseModule,
    PipesModule,
    NameQuestionPopupModule,
    RouterModule,
    PageLoaderModule,
    PermissionsModule,
    ProgressPopupModule,
    UserAvatarModule,
    TeamsModule,
    CommentsModule,
    CustomLinksModule,
    ItemIconModule,
    LayoutModule,

    AntdSharedModule,
    FlexLayoutModule,
    MarketboardModule,
    AlarmsModule,
    MapModule,
    ItemDetailsPopupsModule,
    ItemPickerModule,
    LazyScrollModule,
    SimulatorModule,
    CompanyWorkshopTreeModule,
    InventoryModule,
    HttpClientModule,
    AlarmButtonModule
  ],
  declarations: [
    ListPanelComponent,
    ListDetailsPanelComponent,
    ItemRowComponent,
    TagsPopupComponent,
    ListCompletionPopupComponent,
    ItemSourcesDisplayComponent,
    ItemRowButtonsComponent,
    ListProgressbarComponent,
    ListSplitPopupComponent,
    ItemRowMenuComponent,
    AggregateItemRowComponent,
    CompactItemRowComponent,
    StepByStepDetailsComponent,
    StepByStepDatatypeComponent,
    StepByStepRowComponent,
    CompactAmountInputComponent,
    ItemInventoryButtonComponent
  ],
  exports: [ListPanelComponent, ListDetailsPanelComponent, ItemSourcesDisplayComponent, StepByStepDetailsComponent, CompactAmountInputComponent]
})
export class ListModule {
}
