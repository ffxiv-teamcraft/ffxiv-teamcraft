import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { PlatformService } from '../../tools/platform.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf } from '@angular/common';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
    selector: 'app-login-popup',
    templateUrl: './login-popup.component.html',
    styleUrls: ['./login-popup.component.less'],
    standalone: true,
    imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, NzButtonModule, NzWaveModule, NgIf, NzAlertModule, NzDividerModule, TranslateModule]
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
