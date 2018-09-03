import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.less']
})
export class LoginPopupComponent {

  form: FormGroup;

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private modalRef: NzModalRef) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    // TODO classic login
  }

  public googleOauth(): void {
    this.authFacade.googleOauth().then(() => {
      this.modalRef.close();
    });
  }

  public facebookOauth(): void {
    this.authFacade.facebookOauth().then(() => {
      this.modalRef.close();
    });
  }

}
