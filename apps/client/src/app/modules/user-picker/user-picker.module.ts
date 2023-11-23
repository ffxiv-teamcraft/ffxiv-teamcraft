import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPickerComponent } from './user-picker/user-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseModule } from '../../core/database/database.module';
import { UserPickerService } from './user-picker.service';

import { UserAvatarModule } from '../user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';


@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    UserAvatarModule,
    PipesModule,
    DatabaseModule,
    UserPickerComponent
],
    exports: [UserPickerComponent],
    providers: [UserPickerService]
})
export class UserPickerModule {
}
