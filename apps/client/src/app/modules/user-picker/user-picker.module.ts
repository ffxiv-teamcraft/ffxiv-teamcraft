import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseModule } from '../../core/database/database.module';
import { UserPickerService } from './user-picker.service';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,

    DatabaseModule,

    NgZorroAntdModule
  ],
  declarations: [UserPickerComponent],
  exports: [UserPickerComponent],
  entryComponents: [UserPickerComponent],
  providers: [UserPickerService]
})
export class UserPickerModule {
}
