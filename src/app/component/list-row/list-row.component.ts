import {Component, EventEmitter, Input, Output} from '@angular/core';
import {List} from '../../model/list/list';
import {MdSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-list-row',
    templateUrl: './list-row.component.html',
    styleUrls: ['./list-row.component.scss']
})
export class ListRowComponent {

    @Input()
    public list: List;

    @Input()
    public expanded: boolean;

    @Input()
    public authorUid: number;

    @Output()
    opened: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    closed: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    onrecipedelete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    ondelete: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    onedit: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    public readonly = false;

    constructor(private snack: MdSnackBar, private translator: TranslateService) {
    }

    public getLink(): string {
        return `${window.location.protocol}//${window.location.host}/list/${this.authorUid}/${this.list.$key}`;
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }
}
