import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { ListPickerService } from './list-picker.service';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';
import { FormsModule } from '@angular/forms';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ListModule,

    AntdSharedModule,
    TranslateModule
  ],
  declarations: [ListPickerDrawerComponent],
  providers: [ListPickerService]
})
export class ListPickerModule {
}
