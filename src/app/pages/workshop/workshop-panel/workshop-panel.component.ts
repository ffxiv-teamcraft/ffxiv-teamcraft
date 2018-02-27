import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Workshop} from '../../../model/other/workshop';
import {List} from '../../../model/list/list';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-workshop-panel',
    templateUrl: './workshop-panel.component.html',
    styleUrls: ['./workshop-panel.component.scss']
})
export class WorkshopPanelComponent {

    @Input()
    expanded = false;

    @Input()
    workshop: Workshop;

    @Input()
    lists: List[];

    @Output()
    ondelete: EventEmitter<void> = new EventEmitter<void>();

    constructor(private snack: MatSnackBar, private translator: TranslateService) {
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }

    getLink(): string {
        return `/workshop/${this.workshop.$key}`;
    }

}
