import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FishTrainRoutingModule } from './fish-train-routing.module';
import { FishTrainComponent } from './fish-train/fish-train.component';
import { LoadingScreenModule } from '../loading-screen/loading-screen.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { CoreModule } from '../../core/core.module';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { MapModule } from '../../modules/map/map.module';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PipesModule } from '../../pipes/pipes.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { ContributionPerPassengerComponent } from './contribution-per-passenger/contribution-per-passenger.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [FishTrainComponent, ContributionPerPassengerComponent],
  imports: [
    CommonModule,
    FishTrainRoutingModule,
    LoadingScreenModule,
    FullpageMessageModule,
    TranslateModule,
    PageLoaderModule,
    NzStepsModule,
    CoreModule,
    FishingBaitModule,
    ItemIconModule,
    NzPageHeaderModule,
    NzTagModule,
    NzGridModule,
    MapModule,
    NzCardModule,
    PipesModule,
    NzDividerModule,
    NzPopoverModule,
    NzSpaceModule,
    NzStatisticModule,
    NzEmptyModule,
    NgxEchartsModule
  ]
})
export class FishTrainPageModule {
}
