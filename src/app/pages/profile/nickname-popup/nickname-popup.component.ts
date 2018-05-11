import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {AppUser} from 'app/model/list/app-user';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {Observable} from 'rxjs';
import {ListTemplateService} from '../../../core/database/list-template/list-template.service';

@Component({
    selector: 'app-nickname-popup',
    templateUrl: './nickname-popup.component.html',
    styleUrls: ['./nickname-popup.component.scss']
})
export class NicknamePopupComponent {


    public nickname: string;

    constructor(private linkService: CustomLinksService, private templateService: ListTemplateService, private userService: UserService,
                private dialogRef: MatDialogRef<NicknamePopupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: { user: AppUser, hintTextKey: string, canCancel: boolean }) {
        this.nickname = data.user.nickname;
    }

    canConfirm(): boolean {
        return this.nickname !== undefined && this.nickname.length > 0;
    }

    confirm(): void {
        const user = this.data.user;
        user.nickname = this.nickname;
        const renameLinks = this.linkService.getAllByAuthor(user.$key)
            .mergeMap(links => {
                if (links.length > 0) {
                    return Observable.combineLatest(links.map(link => {
                        link.authorNickname = user.nickname;
                        return this.linkService.set(link.$key, link);
                    }));
                }
                return Observable.of(null);
            });
        const renameTemplates = this.templateService.getAllByAuthor(user.$key)
            .mergeMap(templates => {
                if (templates.length > 0) {
                    return Observable.combineLatest(templates.map(template => {
                        template.authorNickname = user.nickname;
                        return this.templateService.set(template.$key, template);
                    }));
                }
                return Observable.of(null);
            });
        Observable.concat(renameLinks, renameTemplates)
            .mergeMap(() => this.userService.set(user.$key, user))
            .first()
            .subscribe(() => {
                this.dialogRef.close();
            });
    }
}
