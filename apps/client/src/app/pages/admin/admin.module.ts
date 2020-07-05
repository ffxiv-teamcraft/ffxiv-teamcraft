import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { XivapiClientModule } from '@xivapi/angular-client';
import { RouterModule, Routes } from '@angular/router';
import { NzAutocompleteModule, NzFormModule, NzIconModule, NzInputModule, NzListModule, NzSelectModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent
  }
];

@NgModule({
  declarations: [UsersComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
    PipesModule,
    XivapiClientModule,

    RouterModule.forChild(routes),
    FlexLayoutModule,
    NzSelectModule,
    NzFormModule,
    NzAutocompleteModule,
    NzInputModule,
    NzListModule,
    NzIconModule,
    UserAvatarModule,
    FullpageMessageModule
  ]
})
export class AdminModule {
}
