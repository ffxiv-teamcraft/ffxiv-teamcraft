import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { XivapiClientModule, XivapiService } from '@xivapi/angular-client';
import { RouterModule, Routes } from '@angular/router';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { IntegrityCheckPopupComponent } from './users/integrity-check-popup/integrity-check-popup.component';
import { INTEGRITY_CHECKS } from './users/integrity-checks/integrity-check';
import { AllCharactersValidCheck } from './users/integrity-checks/all-characters-valid-check';
import { AdminComponent } from './admin/admin.component';
import { AllListsOkCheck } from './users/integrity-checks/all-lists-ok-check';
import { FirestoreListStorage } from '../../core/database/storage/list/firestore-list-storage';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'users',
        component: UsersComponent
      }
    ]
  }
];

const userIntegrityChecks: Provider[] = [
  {
    provide: INTEGRITY_CHECKS,
    useClass: AllCharactersValidCheck,
    deps: [XivapiService],
    multi: true
  },
  {
    provide: INTEGRITY_CHECKS,
    useClass: AllListsOkCheck,
    deps: [FirestoreListStorage],
    multi: true
  }
];

@NgModule({
  providers: [
    ...userIntegrityChecks
  ],
  declarations: [
    UsersComponent,
    IntegrityCheckPopupComponent,
    AdminComponent
  ],
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
    FullpageMessageModule,
    NzButtonModule,
    NzToolTipModule,
    NzTabsModule
  ]
})
export class AdminModule {
}
