import {Component, OnInit} from '@angular/core';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {CustomLink} from '../../../core/database/custom-links/costum-link';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../../../core/database/user.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CustomLinkPopupComponent} from 'app/pages/custom-links/custom-link-popup/custom-link-popup.component';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';
import {TranslateService} from '@ngx-translate/core';
import {NicknamePopupComponent} from '../../profile/nickname-popup/nickname-popup.component';

@Component({
    selector: 'app-custom-links',
    templateUrl: './custom-links.component.html',
    styleUrls: ['./custom-links.component.scss']
})
export class CustomLinksComponent implements OnInit {

    links: Observable<CustomLink[]>;

    constructor(public customLinkService: CustomLinksService, private userService: UserService, private dialog: MatDialog,
                private listService: ListService, private workshopService: WorkshopService, private snack: MatSnackBar,
                private translator: TranslateService) {
        this.links = this.userService.getUserData().mergeMap(user => {
            return this.customLinkService.getAllByAuthor(user.$key);
        });
    }

    trackByLink(index: number, link: CustomLink) {
        return link.$key;
    }

    openAdditionPopup(): void {
        this.dialog.open(CustomLinkPopupComponent);
    }

    editLink(link: CustomLink): void {
        this.dialog.open(CustomLinkPopupComponent, {data: link});
    }

    deleteLink(link: CustomLink): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed().filter(res => res).mergeMap(() => {
            return this.customLinkService.remove(link.$key);
        }).subscribe();
    }

    showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('CUSTOM_LINKS.Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }

    getName(link: CustomLink): Observable<string> {
        return Observable.of(link.redirectTo)
            .mergeMap(uri => {
                if (uri.startsWith('list/')) {
                    return this.listService.get(uri.replace('list/', ''));
                } else if (uri.startsWith('workshop/')) {
                    return this.workshopService.get(uri.replace('workshop/', ''));
                }
                return Observable.of(null)
            })
            .catch(() => {
                return this.customLinkService.remove(link.$key).map(() => null);
            })
            .filter(val => val !== null)
            .map(element => element.name);
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
