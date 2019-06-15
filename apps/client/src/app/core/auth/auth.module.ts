import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterPopupComponent } from './register-popup/register-popup.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CharacterLinkPopupComponent } from './character-link-popup/character-link-popup.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { OauthService } from './oauth.service';

@NgModule({
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    AngularFireAuthModule,

    NgZorroAntdModule
  ],
  providers: [OauthService],
  declarations: [RegisterPopupComponent, LoginPopupComponent, CharacterLinkPopupComponent],
  entryComponents: [RegisterPopupComponent, LoginPopupComponent, CharacterLinkPopupComponent]
})
export class AuthModule {
}
