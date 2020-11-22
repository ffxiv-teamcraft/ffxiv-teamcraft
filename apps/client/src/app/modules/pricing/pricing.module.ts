import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing/pricing.component';
import { PricingService } from './pricing.service';
import { CoreModule } from '../../core/core.module';
import { PricingRowComponent } from './pricing-row/pricing-row.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PipesModule } from '../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { MarketboardModule } from '../marketboard/marketboard.module';

import { PriceCheckResultComponent } from './price-check-result/price-check-result.component';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    FlexLayoutModule,
    PipesModule,
    ItemIconModule,
    MarketboardModule,
    AntdSharedModule,


    ListModule
  ],
  declarations: [
    PricingComponent,
    PricingRowComponent,
    PriceCheckResultComponent
  ],
  providers: [
    PricingService
  ],
  exports: [
    PricingComponent
  ]
})
export class PricingModule {
}
