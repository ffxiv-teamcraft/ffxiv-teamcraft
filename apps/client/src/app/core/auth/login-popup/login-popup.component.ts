import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { PlatformService } from '../../tools/platform.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.less']
})
export class LoginPopupComponent {

  form: FormGroup;

  errorMessageCode: string;

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private modalRef: NzModalRef, public platform: PlatformService,
              private message: NzMessageService, private translate: TranslateService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    delete this.errorMessageCode;
    this.authFacade.login(this.form.value.email, this.form.value.password)
      .then(() => {
        this.modalRef.close();
      })
      .catch(err => this.onError(err));
  }

  public sendResetPassword(): void {
    const email = this.form.getRawValue().email;
    this.authFacade.resetPassword(email);
    this.message.success(this.translate.instant('SETTINGS.Password_reset_mail_sent'));
    this.modalRef.close();
  }

  private onError(error: any): void {
    this.errorMessageCode = error.code;
  }

  public googleOauth(): void {
    delete this.errorMessageCode;
    this.authFacade.googleOauth().subscribe(() => {
      this.modalRef.close();
    });
  }

  public facebookOauth(): void {
    delete this.errorMessageCode;
    this.authFacade.facebookOauth().subscribe(() => {
      this.modalRef.close();
    });
  }

}
