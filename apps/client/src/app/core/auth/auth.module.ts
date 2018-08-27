import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterPopupComponent } from './register-popup/register-popup.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    NgZorroAntdModule,
  ],
  declarations: [RegisterPopupComponent, LoginPopupComponent],
  entryComponents: [RegisterPopupComponent, LoginPopupComponent]
})
export class AuthModule {
}
