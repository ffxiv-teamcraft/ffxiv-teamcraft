import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {AppUser} from 'app/model/list/app-user';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-nickname-popup',
    templateUrl: './nickname-popup.component.html',
    styleUrls: ['./nickname-popup.component.scss']
})
export class NicknamePopupComponent {


    public nickname: string;

    constructor(private linkService: CustomLinksService, private userService: UserService,
                private dialogRef: MatDialogRef<NicknamePopupComponent>,
                @Inject(MAT_DIALOG_DATA) private data: { user: AppUser, hintTextKey: string, canCancel: boolean }) {
        this.nickname = data.user.nickname;
    }

    canConfirm(): boolean {
        return this.nickname !== undefined && this.nickname.length > 0;
    }

    confirm(): void {
        const user = this.data.user;
        user.nickname = this.nickname;
        this.linkService.getAllByAuthor(user.$key).mergeMap(links => {
            return Observable.combineLatest(links.map(link => {
                link.authorNickname = user.nickname;
                return this.linkService.set(link.$key, link);
            }));
        })
            .mergeMap(() => this.userService.set(user.$key, user))
            .first()
            .subscribe(() => {
                this.dialogRef.close();
            });
    }
}
