import { Component, Inject } from '@angular/core';
import { AppUser } from '../../../model/common/app-user';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserService } from '../../../core/database/user.service';

@Component({
  selector: 'app-user-verification-popup',
  templateUrl: './user-verification-popup.component.html',
  styleUrls: ['./user-verification-popup.component.scss']
})
export class UserVerificationPopupComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public user: AppUser, private userService: UserService,
              private ref: MatDialogRef<UserVerificationPopupComponent>) {
  }

  public check(): void {
    // this.userService.getCharacterWithoutCache()
    //     .pipe(
    //         first(),
    //         mergeMap((character) => {
    //             this.user.verified = character.biography.indexOf(this.user.$key) > -1;
    //             return this.userService.set(this.user.$key, this.user);
    //         })
    //     )
    //     .subscribe(() => {
    //         this.ref.close();
    //     });
  }

}
