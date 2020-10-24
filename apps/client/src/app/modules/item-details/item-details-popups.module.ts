import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HuntingComponent } from './hunting/hunting.component';
import { GatheredByComponent } from './gathered-by/gathered-by.component';
import { InstancesComponent } from './instances/instances.component';
import { VendorsComponent } from './vendors/vendors.component';
import { VoyagesComponent } from './voyages/voyages.component';
import { ReducedFromComponent } from './reduced-from/reduced-from.component';
import { VenturesComponent } from './ventures/ventures.component';
import { TradesComponent } from './trades/trades.component';
import { TreasuresComponent } from './treasures/treasures.component';
import { FatesComponent } from './fates/fates.component';
import { RouterModule } from '@angular/router';
import { DesynthsComponent } from './desynth/desynths.component';
import { RelationshipsComponent } from './relationships/relationships.component';
import { IconsModule } from '../../core/icons/icons.module';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FishingBaitModule } from '../fishing-bait/fishing-bait.module';
import { MapModule } from '../map/map.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { CoreModule } from '../../core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,

    CoreModule,
    ItemIconModule,
    PipesModule,
    AlarmsModule,

    MapModule,
    FishingBaitModule,
    LayoutModule,
    TooltipModule,
    RouterModule,

    FlexLayoutModule,

    TranslateModule,
    NgZorroAntdModule
  ],
  declarations: [
    GatheredByComponent,
    HuntingComponent,
    InstancesComponent,
    ReducedFromComponent,
    VendorsComponent,
    VoyagesComponent,
    VenturesComponent,
    TradesComponent,
    TreasuresComponent,
    FatesComponent,
    DesynthsComponent,
    RelationshipsComponent
  ],
  exports: [
    GatheredByComponent,
    HuntingComponent,
    InstancesComponent,
    ReducedFromComponent,
    VendorsComponent,
    VoyagesComponent,
    VenturesComponent,
    TradesComponent,
    TreasuresComponent,
    FatesComponent,
    DesynthsComponent,
    RelationshipsComponent
  ]
})
export class ItemDetailsPopupsModule {
}
