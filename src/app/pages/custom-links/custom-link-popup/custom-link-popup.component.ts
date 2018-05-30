import {Component, Inject, OnInit} from '@angular/core';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {CustomLink} from '../../../core/database/custom-links/custom-link';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';
import {Workshop} from '../../../model/other/workshop';
import {EMPTY, Observable} from 'rxjs';
import {List} from '../../../model/list/list';
import {UserService} from '../../../core/database/user.service';
import {TranslateService} from '@ngx-translate/core';
import {NicknamePopupComponent} from '../../profile/nickname-popup/nickname-popup.component';
import {CraftingRotation} from '../../../model/other/crafting-rotation';
import {CraftingRotationService} from '../../../core/database/crafting-rotation.service';
import {mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-custom-link-popup',
    templateUrl: './custom-link-popup.component.html',
    styleUrls: ['./custom-link-popup.component.scss']
})
export class CustomLinkPopupComponent implements OnInit {

    types: {
        workshop: Observable<Workshop[]>,
        list: Observable<List[]>,
        simulator: Observable<CraftingRotation[]>,
    };

    selectedType: string;

    selectedUid: string;

    userUid: string;

    userNickname: string;

    selectedRotation: CraftingRotation;

    uri: string;

    constructor(private customLinksService: CustomLinksService, @Inject(MAT_DIALOG_DATA) private data: CustomLink,
                workshopService: WorkshopService, listService: ListService, private userService: UserService,
                private dialogRef: MatDialogRef<CustomLinkPopupComponent>, private snack: MatSnackBar,
                private translator: TranslateService, private dialog: MatDialog, rotationService: CraftingRotationService) {
        if (this.data !== null) {
            const parsedLink = this.data.redirectTo.split('/');
            this.selectedType = parsedLink[0];
            // Special case for crafting rotations
            if (this.selectedType === 'simulator') {
                this.selectedUid = parsedLink[2];
            } else {
                this.selectedUid = parsedLink[1];
            }
            this.uri = this.data.uri;
        }
        userService.getUserData().subscribe(u => {
            this.userUid = u.$key;
            this.userNickname = u.nickname;
        });
        this.types = {
            workshop: userService.getUserData().pipe(mergeMap(user => workshopService.getUserWorkshops(user.$key))),
            list: userService.getUserData().pipe(mergeMap(user => listService.getUserLists(user.$key))),
            simulator: userService.getUserData().pipe(mergeMap(user => rotationService.getUserRotations(user.$key)))
        };
    }

    ngOnInit(): void {
        this.userService.getUserData()
            .pipe(
                mergeMap(user => {
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
                return EMPTY;
            })
            )
            .subscribe();
    }

    canConfirm(): boolean {
        return this.selectedType !== undefined && this.selectedUid !== undefined && this.uri !== undefined && this.uri.length > 0;
    }

    confirm(): void {
        if (this.data === null || this.data.$key === undefined) {
            // If this is a new link
            const link = new CustomLink();
            link.author = this.userUid;
            link.authorNickname = this.userNickname;
            link.uri = this.uri;
            link.redirectTo = this.getRedirectTo();
            this.customLinksService.add(link).subscribe(() => {
                this.openSnack();
                this.dialogRef.close();
            })
        } else {
            const link = this.data;
            link.author = this.userUid;
            link.authorNickname = this.userNickname;
            link.uri = this.uri;
            link.redirectTo = this.getRedirectTo();
            this.customLinksService.set(link.$key, link).subscribe(() => {
                this.openSnack();
                this.dialogRef.close();
            })
        }
    }

    getRedirectTo(): string {
        if (this.data !== undefined && this.data !== null) {
            return this.data.redirectTo;
        } else if (this.selectedType === 'simulator') {
            return `${this.selectedType}/custom/${this.selectedUid}`;
        } else {
            return `${this.selectedType}/${this.selectedUid}`
        }
    }

    openSnack(): void {
        this.snack.open(
            this.translator.instant('Share_link_copied'),
            '', {
                duration: 10000,
                panelClass: ['snack']
            });
    }

    getUrl(): string {
        const link = new CustomLink();
        link.author = this.userUid;
        link.authorNickname = this.userNickname;
        link.uri = this.uri;
        link.redirectTo = `${this.selectedType}/${this.selectedUid}`;
        return link.getUrl();
    }

}
