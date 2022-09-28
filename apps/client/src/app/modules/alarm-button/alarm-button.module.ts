import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmButtonComponent } from './alarm-button/alarm-button.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';



@NgModule({
  declarations: [
    AlarmButtonComponent
  ],
  exports: [
    AlarmButtonComponent
  ],
  imports: [
    CommonModule,
    NzButtonModule,
    AlarmsModule,
    CoreModule,
    PipesModule,
    NzDropDownModule,
    NzToolTipModule,
    NzIconModule
  ]
})
export class AlarmButtonModule { }
