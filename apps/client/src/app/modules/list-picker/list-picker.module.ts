import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { ListPickerService } from './list-picker.service';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';

@NgModule({
  imports: [
    CommonModule,

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
