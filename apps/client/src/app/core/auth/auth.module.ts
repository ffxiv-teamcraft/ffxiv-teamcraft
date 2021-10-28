import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterPopupComponent } from './register-popup/register-popup.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CharacterLinkPopupComponent } from './character-link-popup/character-link-popup.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { OauthService } from './oauth.service';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@NgModule({
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    AngularFireAuthModule,

    NzModalModule,
    NzMessageModule,
    NzFormModule,
    NzAlertModule,
    NzDividerModule,
    NzAutocompleteModule,
    NzListModule,
    NzSpinModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule
  ],
  providers: [OauthService],
  declarations: [RegisterPopupComponent, LoginPopupComponent, CharacterLinkPopupComponent]
})
export class AuthModule {
}
