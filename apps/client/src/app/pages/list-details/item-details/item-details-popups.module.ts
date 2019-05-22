import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../core/icons/icons.module';
import { ItemIconModule } from '../../../modules/item-icon/item-icon.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PipesModule } from '../../../pipes/pipes.module';
import { ClipboardModule } from 'ngx-clipboard';
import { MapModule } from '../../../modules/map/map.module';
import { AlarmsModule } from '../../../core/alarms/alarms.module';
import { FishingBaitModule } from '../../../modules/fishing-bait/fishing-bait.module';
import { LayoutModule } from '@angular/cdk/layout';
import { TooltipModule } from '../../../modules/tooltip/tooltip.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HuntingComponent } from './hunting/hunting.component';
import { GatheredByComponent } from './gathered-by/gathered-by.component';
import { InstancesComponent } from './instances/instances.component';
import { VendorsComponent } from './vendors/vendors.component';
import { VoyagesComponent } from './voyages/voyages.component';
import { ReducedFromComponent } from './reduced-from/reduced-from.component';
import { VenturesComponent } from './ventures/ventures.component';
import { TradesComponent } from './trades/trades.component';
import { CoreModule } from '../../../core/core.module';
import { TreasuresComponent } from './treasures/treasures.component';
import { FatesComponent } from './fates/fates.component';
import { RouterModule } from '@angular/router';
import { DesynthsComponent } from './desynth/desynths.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,

    CoreModule,
    ItemIconModule,
    PipesModule,
    AlarmsModule,
    ClipboardModule,
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
    DesynthsComponent
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
    DesynthsComponent
  ],
  entryComponents: [
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
    DesynthsComponent
  ]
})
export class ItemDetailsPopupsModule {
}
