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
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { FishBreakdownComponent } from './fish-breakdown/fish-breakdown.component';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { BaitBreakdownComponent } from './bait-breakdown/bait-breakdown.component';

@NgModule({
  declarations: [FishTrainComponent, ContributionPerPassengerComponent, FishBreakdownComponent, BaitBreakdownComponent],
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
    NgxEchartsModule,
    UserAvatarModule,
    NzInputModule,
    FormsModule,
    NzSelectModule,
    NzSwitchModule,
    NzFormModule,
    NzAlertModule,
    NzSliderModule,
    NzAffixModule
  ]
})
export class FishTrainPageModule {}
