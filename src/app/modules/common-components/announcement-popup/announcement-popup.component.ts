import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Announcement} from './announcement';

@Component({
    selector: 'app-announcement-popup',
    templateUrl: './announcement-popup.component.html',
    styleUrls: ['./announcement-popup.component.scss']
})
export class AnnouncementPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: Announcement) {
    }
}
