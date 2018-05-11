import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {NicknamePopupComponent} from '../../profile/nickname-popup/nickname-popup.component';
import {UserService} from '../../../core/database/user.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {ListTemplate} from '../../../core/database/list-template/list-template';
import {TranslateService} from '@ngx-translate/core';
import {ListTemplateService} from '../../../core/database/list-template/list-template.service';
import {List} from 'app/model/list/list';
import {ListService} from '../../../core/database/list.service';

@Component({
    selector: 'app-template-popup',
    templateUrl: './template-popup.component.html',
    styleUrls: ['./template-popup.component.scss']
})
export class TemplatePopupComponent implements OnInit {

    public lists: Observable<List[]>;

    constructor(private userService: UserService, @Inject(MAT_DIALOG_DATA) public template: ListTemplate,
                private templateService: ListTemplateService, private dialogRef: MatDialogRef<TemplatePopupComponent>,
                private snack: MatSnackBar, private translator: TranslateService, private dialog: MatDialog,
                listService: ListService) {
        this.lists = userService.getUserData().mergeMap(user => listService.getUserLists(user.$key));
    }

    submit(): void {
        if (this.template.$key === undefined) {
            this.templateService.add(this.template).subscribe(() => {
                this.openSnack();
                this.dialogRef.close();
            });
        } else {
            this.templateService.set(this.template.$key, this.template).subscribe(() => {
                this.dialogRef.close();
            });
        }
    }

    openSnack(): void {
        this.snack.open(
            this.translator.instant('LIST_TEMPLATE.Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }

    canConfirm(): boolean {
        return this.template.uri !== undefined && this.template.uri.length > 0 && this.template.originalListId !== undefined
            && this.template.originalListId.length > 0;
    }

    ngOnInit(): void {
        this.userService.getUserData()
            .mergeMap(user => {
                if (user.nickname === undefined || user.nickname.length === 0) {
                    return this.dialog.open(NicknamePopupComponent, {
                        data: {
                            user: user,
                            hintTextKey: 'PROFILE.Feature_requires_nickname',
                            canCancel: false
                        },
                        disableClose: true,
                    }).afterClosed();
                }
                return Observable.empty();
            })
            .subscribe();
    }

}
