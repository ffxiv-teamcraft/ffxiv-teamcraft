import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-register-popup',
  templateUrl: './register-popup.component.html',
  styleUrls: ['./register-popup.component.less']
})
export class RegisterPopupComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder, private authFacade: AuthFacade,
              private modalRef: NzModalRef) {
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
    // TODO classic registration.
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

  ngOnInit() {
  }

}
