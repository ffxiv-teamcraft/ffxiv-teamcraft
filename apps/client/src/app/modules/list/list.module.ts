import { NgModule, Provider } from '@angular/core';
import { DataExtractorService, EXTRACTORS } from './data/data-extractor.service';
import { CraftedByExtractor } from './data/extractor/crafted-by-extractor';
import { GarlandToolsService } from '../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../core/tools/html-tools.service';
import { GatheredByExtractor } from './data/extractor/gathered-by-extractor';
import { TradeSourcesExtractor } from './data/extractor/trade-sources-extractor';
import { VendorsExtractor } from './data/extractor/vendors-extractor';
import { ReducedFromExtractor } from './data/extractor/reduced-from-extractor';
import { DesynthsExtractor } from './data/extractor/desynths-extractor';
import { InstancesExtractor } from './data/extractor/instances-extractor';
import { GardeningExtractor } from './data/extractor/gardening-extractor';
import { VoyagesExtractor } from './data/extractor/voyages-extractor';
import { DropsExtractor } from './data/extractor/drops-extractor';
import { VenturesExtractor } from './data/extractor/ventures-extractor';
import { CoreModule } from '../../core/core.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as listsInitialState, listsReducer } from './+state/lists.reducer';
import { ListsEffects } from './+state/lists.effects';
import { DatabaseModule } from '../../core/database/database.module';
import { ListPanelComponent } from './list-panel/list-panel.component';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';
import { NameQuestionPopupModule } from '../name-question-popup/name-question-popup.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AlarmsExtractor } from './data/extractor/alarms-extractor';
import { MasterbooksExtractor } from './data/extractor/masterbooks-extractor';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TagsPopupComponent } from './tags-popup/tags-popup.component';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { IconsModule } from '../../core/icons/icons.module';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { TeamsModule } from '../teams/teams.module';
import { CommentsModule } from '../comments/comments.module';
import { CustomLinksModule } from '../custom-links/custom-links.module';
import { ListCompletionPopupComponent } from './list-completion-popup/list-completion-popup.component';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { ProgressPopupModule } from '../progress-popup/progress-popup.module';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { TreasuresExtractor } from './data/extractor/treasures-extractor';
import { FatesExtractor } from './data/extractor/fates-extractor';
import { ListDetailsPanelComponent } from './list-details-panel/list-details-panel.component';
import { ItemRowComponent } from './item/item-row/item-row.component';
import { MarketboardModule } from '../marketboard/marketboard.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { MapModule } from '../map/map.module';
import { ItemDetailsPopupsModule } from '../item-details/item-details-popups.module';
import { ItemSourcesDisplayComponent } from './item/item-sources-display/item-sources-display.component';
import { AlarmButtonComponent } from './item/alarm-button/alarm-button.component';
import { ItemRowButtonsComponent } from './item/item-row-buttons/item-row-buttons.component';
import { ListProgressbarComponent } from './list-progressbar/list-progressbar.component';
import { LazyScrollModule } from '../lazy-scroll/lazy-scroll.module';
import { ListSplitPopupComponent } from './list-split-popup/list-split-popup.component';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { ItemPickerModule } from '../item-picker/item-picker.module';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';
import { SimulatorModule } from '../../pages/simulator/simulator.module';
import { RequirementsExtractor } from './data/extractor/requirements-extractor';
import { CompanyWorkshopTreeModule } from '../company-workshop-tree/company-workshop-tree.module';
import { GatheringNodesService } from '../../core/data/gathering-nodes.service';
import { InventoryModule } from '../inventory/inventory.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';


export const DATA_EXTRACTORS: Provider[] = [
  { provide: EXTRACTORS, useClass: CraftedByExtractor, deps: [GarlandToolsService, HtmlToolsService], multi: true },
  {
    provide: EXTRACTORS,
    useClass: GatheredByExtractor,
    deps: [GarlandToolsService, HtmlToolsService, GatheringNodesService, LazyDataService],
    multi: true
  },
  { provide: EXTRACTORS, useClass: TradeSourcesExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: VendorsExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: ReducedFromExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: DesynthsExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: InstancesExtractor, deps: [GarlandToolsService], multi: true },
  { provide: EXTRACTORS, useClass: GardeningExtractor, deps: [GarlandToolsService, LazyDataService, HttpClient], multi: true },
  { provide: EXTRACTORS, useClass: VoyagesExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: DropsExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: VenturesExtractor, deps: [GarlandToolsService], multi: true },
  { provide: EXTRACTORS, useClass: AlarmsExtractor, deps: [GarlandToolsService, GatheringNodesService, AlarmsFacade], multi: true },
  { provide: EXTRACTORS, useClass: MasterbooksExtractor, deps: [GarlandToolsService], multi: true },
  { provide: EXTRACTORS, useClass: TreasuresExtractor, deps: [GarlandToolsService], multi: true },
  { provide: EXTRACTORS, useClass: FatesExtractor, deps: [GarlandToolsService, LazyDataService], multi: true },
  { provide: EXTRACTORS, useClass: RequirementsExtractor, deps: [GarlandToolsService, LazyDataService], multi: true }
];

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
    IconsModule,
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

    StoreModule.forFeature('lists', listsReducer, { initialState: listsInitialState }),
    EffectsModule.forFeature([ListsEffects]),
    LazyScrollModule,
    SimulatorModule,
    CompanyWorkshopTreeModule,
    InventoryModule,
    HttpClientModule
  ],
  providers: [
    ...DATA_EXTRACTORS,
    DataExtractorService
  ],
  declarations: [
    ListPanelComponent,
    ListDetailsPanelComponent,
    ItemRowComponent,
    TagsPopupComponent,
    ListCompletionPopupComponent,
    ItemSourcesDisplayComponent,
    AlarmButtonComponent,
    ItemRowButtonsComponent,
    ListProgressbarComponent,
    ListSplitPopupComponent
  ],
  exports: [ListPanelComponent, ListDetailsPanelComponent, ItemSourcesDisplayComponent, AlarmButtonComponent]
})
export class ListModule {

}
