import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';

import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {filter, first, tap} from 'rxjs/operators';
import {concat} from 'rxjs/index';

@Component({
    selector: 'app-bulk-addition-popup',
    templateUrl: './bulk-addition-popup.component.html',
    styleUrls: ['./bulk-addition-popup.component.scss']
})
export class BulkAdditionPopupComponent extends ComponentWithSubscriptions implements OnInit {

    progress = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<BulkAdditionPopupComponent>,
                private listService: ListService) {
        super();
    }

    ngOnInit(): void {
        let done = 0;
        this.subscriptions.push(concat(...this.data.additions)
            .pipe(
                tap(() => {
                    done++;
                    this.progress = Math.ceil(100 * done / this.data.additions.length);
                }),
                filter(() => this.progress >= 100)
            ).subscribe((resultList: List) => {
                this.listService.update(this.data.key, resultList).pipe(first()).subscribe(() => {
                    this.dialogRef.close();
                });
            }));
    }
}
