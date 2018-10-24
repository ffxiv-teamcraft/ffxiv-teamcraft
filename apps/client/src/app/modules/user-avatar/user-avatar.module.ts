import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { DatabaseModule } from '../../core/database/database.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { XivapiClientModule } from '@xivapi/angular-client';
import { CoreModule } from '../../core/core.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    CoreModule,

    DatabaseModule,
    XivapiClientModule,

    NgZorroAntdModule
  ],
  declarations: [UserAvatarComponent],
  exports: [UserAvatarComponent],
})
export class UserAvatarModule {
}
