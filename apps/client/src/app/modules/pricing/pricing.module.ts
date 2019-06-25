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
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { MarketboardModule } from '../marketboard/marketboard.module';
import { ClipboardModule } from 'ngx-clipboard';
import { PriceCheckResultComponent } from './price-check-result/price-check-result.component';

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
    NgZorroAntdModule,
    ClipboardModule,

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
  ],
  entryComponents: [
    PriceCheckResultComponent
  ]
})
export class PricingModule {
}
