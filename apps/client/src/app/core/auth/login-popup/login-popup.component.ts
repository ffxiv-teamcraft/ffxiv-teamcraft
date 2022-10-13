import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { PlatformService } from '../../tools/platform.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.less']
})
export class LoginPopupComponent {

  form: UntypedFormGroup;

  errorMessageCode: string;

  constructor(private fb: UntypedFormBuilder, private authFacade: AuthFacade,
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
        this.modalRef.close(true);
      })
      .catch(err => this.onError(err));
  }

  public sendResetPassword(): void {
    const email = this.form.getRawValue().email;
    this.authFacade.resetPassword(email);
    this.message.success(this.translate.instant('SETTINGS.Password_reset_mail_sent'));
    this.modalRef.close(false);
  }

  public googleOauth(): void {
    delete this.errorMessageCode;
    this.authFacade.googleOauth().subscribe(() => {
      this.modalRef.close(true);
    });
  }

  private onError(error: any): void {
    this.errorMessageCode = error.code;
  }

}
