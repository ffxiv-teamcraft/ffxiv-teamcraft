import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { ListPickerService } from './list-picker.service';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ListModule,

    NgZorroAntdModule,
    TranslateModule
  ],
  declarations: [ListPickerDrawerComponent],
  entryComponents: [ListPickerDrawerComponent],
  providers: [ListPickerService]
})
export class ListPickerModule {
}
