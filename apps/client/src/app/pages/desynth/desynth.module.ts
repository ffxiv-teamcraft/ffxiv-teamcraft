import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { DesynthComponent } from './desynth/desynth.component';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

const routes: Routes = [
  {
    path: '',
    component: DesynthComponent
  }
];

@NgModule({
  declarations: [DesynthComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AntdSharedModule,

    PipesModule,
    CoreModule,
    ListModule,
    FlexLayoutModule,
    FullpageMessageModule,
    MarketboardModule,
    ProgressPopupModule,
    PageLoaderModule,

    RouterModule.forChild(routes),
    ItemIconModule,
    NzPaginationModule
  ]
})
export class DesynthModule {
}
