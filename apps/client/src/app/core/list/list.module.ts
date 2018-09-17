import { NgModule, Provider } from '@angular/core';
import { EXTRACTORS } from './data/data-extractor.service';
import { CraftedByExtractor } from './data/extractor/crafted-by-extractor';
import { GarlandToolsService } from '../api/garland-tools.service';
import { HtmlToolsService } from '../tools/html-tools.service';
import { DataService } from '../api/data.service';
import { GatheredByExtractor } from './data/extractor/gathered-by-extractor';
import { LocalizedDataService } from '../data/localized-data.service';
import { TradeSourcesExtractor } from './data/extractor/trade-sources-extractor';
import { VendorsExtractor } from './data/extractor/vendors-extractor';
import { ReducedFromExtractor } from './data/extractor/reduced-from-extractor';
import { DesynthsExtractor } from './data/extractor/desynths-extractor';
import { InstancesExtractor } from './data/extractor/instances-extractor';
import { GardeningExtractor } from './data/extractor/gardening-extractor';
import { VoyagesExtractor } from './data/extractor/voyages-extractor';
import { DropsExtractor } from './data/extractor/drops-extractor';
import { VenturesExtractor } from './data/extractor/ventures-extractor';
import { CoreModule } from '../core.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as listsInitialState, listsReducer } from './+state/lists.reducer';
import { ListsEffects } from './+state/lists.effects';
import { ListsFacade } from './+state/lists.facade';


export const DATA_EXTRACTORS: Provider[] = [
  { provide: EXTRACTORS, useClass: CraftedByExtractor, deps: [GarlandToolsService, HtmlToolsService, DataService], multi: true },
  { provide: EXTRACTORS, useClass: GatheredByExtractor, deps: [GarlandToolsService, HtmlToolsService, LocalizedDataService], multi: true },
  { provide: EXTRACTORS, useClass: TradeSourcesExtractor, deps: [DataService], multi: true },
  { provide: EXTRACTORS, useClass: VendorsExtractor, deps: [DataService], multi: true },
  { provide: EXTRACTORS, useClass: ReducedFromExtractor, multi: true },
  { provide: EXTRACTORS, useClass: DesynthsExtractor, multi: true },
  { provide: EXTRACTORS, useClass: InstancesExtractor, multi: true },
  { provide: EXTRACTORS, useClass: GardeningExtractor, multi: true },
  { provide: EXTRACTORS, useClass: VoyagesExtractor, multi: true },
  { provide: EXTRACTORS, useClass: DropsExtractor, multi: true },
  { provide: EXTRACTORS, useClass: VenturesExtractor, multi: true }
];

@NgModule({
  imports: [
    CoreModule,
    StoreModule.forFeature('lists', listsReducer, { initialState: listsInitialState }),
    EffectsModule.forFeature([ListsEffects]),
  ],
  providers: [
    ...DATA_EXTRACTORS,
    ListsFacade
  ]
})
export class ListModule {

}
