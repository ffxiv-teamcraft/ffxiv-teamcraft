import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { PlatformService } from '../../tools/platform.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DialogComponent } from '../../dialog.component';

@Component({
    selector: 'app-login-popup',
    templateUrl: './login-popup.component.html',
    styleUrls: ['./login-popup.component.less'],
    standalone: true,
    imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, NzButtonModule, NzWaveModule, NzAlertModule, NzDividerModule, TranslateModule]
})
export class LoginPopupComponent extends DialogComponent {
  private fb = inject(UntypedFormBuilder);
  private authFacade = inject(AuthFacade);
  private modalRef = inject(NzModalRef);
  platform = inject(PlatformService);
  private message = inject(NzMessageService);
  private translate = inject(TranslateService);


  form: UntypedFormGroup;

  errorMessageCode: string;

  isForSensitiveOperation = false;

  constructor() {
    super();
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.patchData();
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
