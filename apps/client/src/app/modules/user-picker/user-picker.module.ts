import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseModule } from '../../core/database/database.module';
import { UserPickerService } from './user-picker.service';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    PageLoaderModule,
    UserAvatarModule,
    PipesModule,

    DatabaseModule,

    AntdSharedModule
  ],
  declarations: [UserPickerComponent],
  exports: [UserPickerComponent],
  providers: [UserPickerService]
})
export class UserPickerModule {
}
