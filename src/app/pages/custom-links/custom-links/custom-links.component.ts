import {Component} from '@angular/core';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {CustomLink} from '../../../core/database/custom-links/costum-link';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../../../core/database/user.service';
import {MatDialog} from '@angular/material';
import {CustomLinkPopupComponent} from 'app/pages/custom-links/custom-link-popup/custom-link-popup.component';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';

@Component({
    selector: 'app-custom-links',
    templateUrl: './custom-links.component.html',
    styleUrls: ['./custom-links.component.scss']
})
export class CustomLinksComponent {

    links: Observable<CustomLink[]>;

    constructor(public customLinkService: CustomLinksService, private userService: UserService, private dialog: MatDialog,
                private listService: ListService, private workshopService: WorkshopService) {
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

    getName(fullUri: string): Observable<string> {
        return Observable.of(fullUri)
            .mergeMap(uri => {
                if (uri.startsWith('list/')) {
                    return this.listService.get(uri.replace('list/', ''));
                } else if (uri.startsWith('workshop/')) {
                    return this.workshopService.get(uri.replace('workshop/', ''));
                }
                return Observable.of(null)
            })
            .filter(val => val !== null)
            .map(element => element.name);
    }

}
