import {Component, Inject} from '@angular/core';
import {MasterbookService} from '../masterbook.service';
import {UserService} from '../../../core/database/user.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {AppUser} from '../../../model/list/app-user';

@Component({
    selector: 'app-masterbooks-popup',
    templateUrl: './masterbooks-popup.component.html',
    styleUrls: ['./masterbooks-popup.component.scss']
})
export class MasterbooksPopupComponent {

    constructor(public masterbookService: MasterbookService, private userService: UserService,
                @Inject(MAT_DIALOG_DATA) public data: { jobAbbr: string, user: AppUser }) {
    }

    setMasterbook(id: number, active: boolean): void {
        // We set a default value if it's currently undefined.
        this.data.user.masterbooks = this.data.user.masterbooks || [];
        if (active) {
            this.data.user.masterbooks.push(id);
        } else {
            this.data.user.masterbooks = this.data.user.masterbooks.filter(bookId => bookId !== id);
        }
    }

    checkAll(ids: number[]): void {
        // We set a default value if it's currently undefined.
        this.data.user.masterbooks = this.data.user.masterbooks || [];
        ids.forEach(id => {
            if (this.data.user.masterbooks.indexOf(id) === -1) {
                this.data.user.masterbooks.push(id);
            }
        })
    }

    /**
     * Submits the data to save masterbooks in database.
     */
    submit(): void {
        this.userService.update(this.data.user.$key, this.data.user).subscribe();
    }
}
