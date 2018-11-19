import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseModule } from '../../core/database/database.module';
import { UserPickerService } from './user-picker.service';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';

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

    NgZorroAntdModule
  ],
  declarations: [UserPickerComponent],
  exports: [UserPickerComponent],
  entryComponents: [UserPickerComponent],
  providers: [UserPickerService]
})
export class UserPickerModule {
}
