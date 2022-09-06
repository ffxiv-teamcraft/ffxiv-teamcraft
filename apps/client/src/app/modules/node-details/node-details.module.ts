import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeDetailsComponent } from './node-details/node-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MapModule } from '../map/map.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GatheringItemUsesComponent } from './gathering-item-uses/gathering-item-uses.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { AlarmButtonModule } from '../alarm-button/alarm-button.module';


@NgModule({
  declarations: [
    NodeDetailsComponent,
    GatheringItemUsesComponent
  ],
  exports: [
    NodeDetailsComponent,
    GatheringItemUsesComponent
  ],
  imports: [
    CommonModule,

    TranslateModule,
    FlexLayoutModule,
    NzTagModule,
    PipesModule,
    CoreModule,
    AlarmsModule,
    NzDropDownModule,
    MapModule,
    NzPopoverModule,
    AlarmButtonModule
  ]
})
export class NodeDetailsModule {
}
