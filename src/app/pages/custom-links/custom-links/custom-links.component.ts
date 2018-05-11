import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {CustomLink} from '../../../core/database/custom-links/costum-link';
import {Observable} from 'rxjs';
import {UserService} from '../../../core/database/user.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CustomLinkPopupComponent} from 'app/pages/custom-links/custom-link-popup/custom-link-popup.component';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';
import {TranslateService} from '@ngx-translate/core';
import {NicknamePopupComponent} from '../../profile/nickname-popup/nickname-popup.component';
import {ListTemplateService} from '../../../core/database/list-template/list-template.service';
import {ListTemplate} from '../../../core/database/list-template/list-template';
import {TemplatePopupComponent} from '../../template/template-popup/template-popup.component';
import {CraftingRotationService} from '../../../core/database/crafting-rotation.service';

@Component({
    selector: 'app-custom-links',
    templateUrl: './custom-links.component.html',
    styleUrls: ['./custom-links.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomLinksComponent implements OnInit {

    links: Observable<CustomLink[]>;

    constructor(public customLinkService: CustomLinksService, private userService: UserService, private dialog: MatDialog,
                private listService: ListService, private workshopService: WorkshopService, private snack: MatSnackBar,
                private translator: TranslateService, private templateService: ListTemplateService,
                private rotationsService: CraftingRotationService) {
        this.links = this.userService.getUserData().mergeMap(user => {
            return this.customLinkService.getAllByAuthor(user.$key).mergeMap(links => {
                return this.templateService.getAllByAuthor(user.$key).map(templates => links.concat(templates));
            });
        });
    }

    trackByLink(index: number, link: CustomLink) {
        return link.$key;
    }

    openAdditionPopup(): void {
        this.dialog.open(CustomLinkPopupComponent);
    }

    editLink(link: CustomLink): void {
        if (link.template) {
            this.dialog.open(TemplatePopupComponent, {data: link});
        } else {
            this.dialog.open(CustomLinkPopupComponent, {data: link});
        }
    }

    deleteLink(link: CustomLink): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed().filter(res => res).mergeMap(() => {
            if (link.template) {
                return this.templateService.remove(link.$key);
            }
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

    showTemplateCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('LIST_TEMPLATE.Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }

    getName(plink: CustomLink): Observable<string> {
        return Observable.of(plink)
            .mergeMap(link => {
                if (link.template) {
                    return this.listService.get((<ListTemplate>link).originalListId)
                } else if (link.redirectTo.startsWith('list/')) {
                    return this.listService.get(link.redirectTo.replace('list/', ''));
                } else if (link.redirectTo.startsWith('workshop/')) {
                    return this.workshopService.get(link.redirectTo.replace('workshop/', ''));
                } else if (link.redirectTo.startsWith('simulator/')) {
                    return this.rotationsService.get(link.redirectTo.split('/')[2]);
                }
                return Observable.of(null)
            })
            .catch(() => {
                if (!plink.template) {
                    return this.customLinkService.remove(plink.$key).map(() => null);
                } else {
                    return this.templateService.remove(plink.$key).map(() => null);
                }
            })
            .filter(val => val !== null)
            .map(element => element.name || element.getName());
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
