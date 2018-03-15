import {Component, Inject} from '@angular/core';
import {CustomLinksService} from '../../../core/database/custom-links/custom-links.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CustomLink} from '../../../core/database/custom-links/costum-link';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';
import {Workshop} from '../../../model/other/workshop';
import {Observable} from 'rxjs/Observable';
import {List} from '../../../model/list/list';
import {UserService} from '../../../core/database/user.service';

@Component({
    selector: 'app-custom-link-popup',
    templateUrl: './custom-link-popup.component.html',
    styleUrls: ['./custom-link-popup.component.scss']
})
export class CustomLinkPopupComponent {

    types: {
        workshop: Observable<Workshop[]>,
        list: Observable<List[]>,
    };

    selectedType: string;

    selectedUid: string;

    userUid: string;

    uri: string;

    constructor(private customLinksService: CustomLinksService, @Inject(MAT_DIALOG_DATA) private data: CustomLink,
                workshopService: WorkshopService, listService: ListService, userService: UserService,
                private dialogRef: MatDialogRef<CustomLinkPopupComponent>) {
        if (this.data !== null) {
            const parsedLink = this.data.redirectTo.split('/');
            this.selectedType = parsedLink[0];
            this.selectedUid = parsedLink[1];
            this.uri = this.data.uri;
        }
        userService.getUserData().subscribe(u => this.userUid = u.$key);
        this.types = {
            workshop: userService.getUserData().mergeMap(user => workshopService.getUserWorkshops(user.$key)),
            list: userService.getUserData().mergeMap(user => listService.getUserLists(user.$key))
        };
    }

    canConfirm(): boolean {
        return this.selectedType !== undefined && this.selectedUid !== undefined && this.uri !== undefined && this.uri.length > 0;
    }

    confirm(): void {
        if (this.data === null) {
            // If this is a new link
            const link = new CustomLink();
            link.author = this.userUid;
            link.uri = this.uri;
            link.redirectTo = `${this.selectedType}/${this.selectedUid}`;
            this.customLinksService.add(link).subscribe(() => {
                this.dialogRef.close();
            })
        } else {
            const link = this.data;
            link.author = this.userUid;
            link.uri = this.uri;
            link.redirectTo = `${this.selectedType}/${this.selectedUid}`;
            this.customLinksService.set(link.$key, link).subscribe(() => {
                this.dialogRef.close();
            })
        }
    }

}
