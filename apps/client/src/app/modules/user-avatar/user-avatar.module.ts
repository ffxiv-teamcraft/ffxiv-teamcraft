import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { DatabaseModule } from '../../core/database/database.module';
import { XivapiClientModule } from '@xivapi/angular-client';
import { CoreModule } from '../../core/core.module';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@NgModule({
    imports: [
    CommonModule,
    RouterModule,
    CoreModule,
    FlexLayoutModule,
    DatabaseModule,
    XivapiClientModule,
    NzAvatarModule,
    UserAvatarComponent
],
    exports: [UserAvatarComponent]
})
export class UserAvatarModule {
}
