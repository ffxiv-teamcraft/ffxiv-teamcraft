import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password-popup',
  templateUrl: './forgot-password-popup.component.html',
  styleUrls: ['./forgot-password-popup.component.scss']
})
export class ForgotPasswordPopupComponent {

  public email: string;

  public error: string;

  constructor(private af: AngularFireAuth, private ref: MatDialogRef<ForgotPasswordPopupComponent>,
              private snack: MatSnackBar, private translate: TranslateService) {
  }

  sendEmail(): void {
    this.af.auth.sendPasswordResetEmail(this.email)
      .then(() => {
        this.snack.open(this.translate.instant('Email_sent'), '', { duration: 5000 });
        this.ref.close();
      })
      .catch(err => this.error = (<any>err).code);
  }

}
