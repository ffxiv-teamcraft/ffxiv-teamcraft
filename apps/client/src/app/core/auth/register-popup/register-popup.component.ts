import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register-popup',
  templateUrl: './register-popup.component.html',
  styleUrls: ['./register-popup.component.less']
})
export class RegisterPopupComponent {

  form: FormGroup;

  errorMessageCode: string;

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private modalRef: NzModalRef, private messageService: NzMessageService,
              private translate: TranslateService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validator: this.matchPasswords
    });
  }

  private matchPasswords(AC: AbstractControl) {
    const password = AC.get('password').value; // to get value in input tag
    const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      AC.get('confirmPassword').setErrors({ matchPassword: true });
    } else {
      return null;
    }
  }

  public submit(): void {
    delete this.errorMessageCode;
    this.authFacade.register(this.form.value.email, this.form.value.password)
      .then(() => {
        this.modalRef.close();
        this.messageService.info(this.translate.instant('Verification_mail_sent'), {
          nzDuration: 5000,
          nzPauseOnHover: true,
          nzAnimate: true
        });
      }).catch(err => this.onError(err));
  }

  private onError(error: any): void {
    this.errorMessageCode = error.code;
  }

  public googleOauth(): void {
    delete this.errorMessageCode;
    this.authFacade.googleOauth()
      .then(() => {
        this.modalRef.close();
      });
  }

  public facebookOauth(): void {
    delete this.errorMessageCode;
    this.authFacade.facebookOauth()
      .then(() => {
        this.modalRef.close();
      });
  }

}
