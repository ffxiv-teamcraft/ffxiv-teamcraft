import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { ListPickerService } from './list-picker.service';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';
import { FormsModule } from '@angular/forms';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ListModule,
    TranslateModule,
    ListPickerDrawerComponent,
    NzDrawerModule
  ],
  providers: [ListPickerService]
})
export class ListPickerModule {
}
