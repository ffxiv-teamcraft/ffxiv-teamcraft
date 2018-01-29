import {Component, Inject, OnInit} from '@angular/core';
import {ListService} from '../../../core/database/list.service';
import {Observable} from 'rxjs/Observable';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {List} from '../../../model/list/list';

@Component({
    selector: 'app-bulk-regenerate-popup',
    templateUrl: './bulk-regenerate-popup.component.html',
    styleUrls: ['./bulk-regenerate-popup.component.scss']
})
export class BulkRegeneratePopupComponent extends ComponentWithSubscriptions implements OnInit {

    progress = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<BulkRegeneratePopupComponent>,
                private listService: ListService, private listManager: ListManagerService) {
        super();
    }

    ngOnInit(): void {
        let done = 0;
        const regenerations: Observable<List>[] = this.data.map(list => {
            return this.listManager.upgradeList(list)
                .switchMap((l: List) => this.listService.set(l.$key, l));
        });
        this.subscriptions.push(
            Observable.concat(...regenerations)
                .do(() => {
                    done++;
                    this.progress = Math.ceil(100 * done / this.data.length);
                })
                .filter(() => this.progress >= 100)
                .subscribe(() => {
                    this.dialogRef.close();
                }));
    }

}
