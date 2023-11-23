import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencySpendingComponent } from './currency-spending/currency-spending.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';

import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { MapModule } from '../../modules/map/map.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';



const routes: Routes = [{
  path: '',
  component: CurrencySpendingComponent
}];

@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    PipesModule,
    FullpageMessageModule,
    MapModule,
    ItemIconModule,
    TranslateModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    MarketboardModule,
    CurrencySpendingComponent
]
})
export class CurrencySpendingModule {
}
