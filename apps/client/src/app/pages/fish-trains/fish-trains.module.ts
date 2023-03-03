import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FishTrainsRoutingModule } from './fish-trains-routing.module';
import { FishTrainsComponent } from './fish-trains/fish-trains.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzListModule } from 'ng-zorro-antd/list';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { LazyScrollModule } from '../../modules/lazy-scroll/lazy-scroll.module';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';


@NgModule({
  declarations: [
    FishTrainsComponent
  ],
  imports: [
    CommonModule,
    FishTrainsRoutingModule,
    NzPageHeaderModule,
    TranslateModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSegmentedModule,
    NzListModule,
    FullpageMessageModule,
    LazyScrollModule,
    UserAvatarModule,
    NzAvatarModule,
    NzToolTipModule,
    NzTagModule
  ]
})
export class FishTrainsModule {
}
