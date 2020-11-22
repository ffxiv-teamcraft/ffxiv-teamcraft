import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencySpendingComponent } from './currency-spending/currency-spending.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { MapModule } from '../../modules/map/map.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { AntdSharedModule } from '../../core/antd-shared.module';


const routes: Routes = [{
  path: '',
  component: CurrencySpendingComponent
}];

@NgModule({
  declarations: [CurrencySpendingComponent],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,

    PipesModule,
    PageLoaderModule,
    FullpageMessageModule,
    MapModule,
    ItemIconModule,

    TranslateModule,
    AntdSharedModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    MarketboardModule
  ]
})
export class CurrencySpendingModule {
}
