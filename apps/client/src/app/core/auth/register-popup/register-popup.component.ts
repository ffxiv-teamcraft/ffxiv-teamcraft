import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { PlatformService } from '../../tools/platform.service';
import { TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf } from '@angular/common';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
    selector: 'app-register-popup',
    templateUrl: './register-popup.component.html',
    styleUrls: ['./register-popup.component.less'],
    standalone: true,
    imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, NzButtonModule, NzWaveModule, NgIf, NzAlertModule, NzDividerModule, TranslateModule]
})
export class RegisterPopupComponent {

  form: UntypedFormGroup;

  errorMessageCode: string;

  constructor(private fb: UntypedFormBuilder, private authFacade: AuthFacade,
              private modalRef: NzModalRef, public platform: PlatformService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validator: this.matchPasswords
    });
  }

  public submit(): void {
    delete this.errorMessageCode;
    this.authFacade.register(this.form.value.email, this.form.value.password)
      .then(() => {
        this.modalRef.close();
      }).catch(err => this.onError(err));
  }

  public googleOauth(): void {
    delete this.errorMessageCode;
    this.authFacade.googleOauth()
      .subscribe(() => {
        this.modalRef.close();
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

  private onError(error: any): void {
    this.errorMessageCode = error.code;
  }

}
