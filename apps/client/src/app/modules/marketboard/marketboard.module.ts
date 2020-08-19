import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketboardIconComponent } from './marketboard-icon/marketboard-icon.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { XivapiClientModule } from '@xivapi/angular-client';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MarketboardPopupComponent } from './marketboard-popup/marketboard-popup.component';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    PipesModule,
    TranslateModule,
    XivapiClientModule,
    PageLoaderModule,
    FlexLayoutModule,

    NgZorroAntdModule
  ],
  declarations: [MarketboardIconComponent, MarketboardPopupComponent],
  exports: [MarketboardIconComponent, MarketboardPopupComponent]
})
export class MarketboardModule {
}
