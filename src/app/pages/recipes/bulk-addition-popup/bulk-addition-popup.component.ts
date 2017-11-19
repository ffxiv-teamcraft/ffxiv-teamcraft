import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';
import 'rxjs/add/observable/concat';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';

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
        this.subscriptions.push(Observable.concat(...this.data.additions)
            .do(() => {
                done++;
                this.progress = Math.ceil(100 * done / this.data.additions.length);
            })
            .filter(() => this.progress >= 100)
            .subscribe((resultList: List) => {
                this.listService.update(this.data.key, resultList).then(() => {
                    this.dialogRef.close();
                });
            }));
    }
}
