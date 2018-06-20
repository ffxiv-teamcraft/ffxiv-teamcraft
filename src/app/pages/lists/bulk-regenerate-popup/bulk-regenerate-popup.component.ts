import {Component, Inject, OnInit} from '@angular/core';
import {ListService} from '../../../core/database/list.service';
import {concat, Observable, of} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {List} from '../../../model/list/list';
import {filter, mergeMap, switchMap, tap} from 'rxjs/operators';

@Component({
    selector: 'app-bulk-regenerate-popup',
    templateUrl: './bulk-regenerate-popup.component.html',
    styleUrls: ['./bulk-regenerate-popup.component.scss']
})
export class BulkRegeneratePopupComponent extends ComponentWithSubscriptions implements OnInit {

    progress = 0;

    currentList: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<BulkRegeneratePopupComponent>,
                private listService: ListService, private listManager: ListManagerService) {
        super();
    }

    ngOnInit(): void {
        let done = 0;
        const regenerations: Observable<List>[] = this.data.map(list => {
            return of(list)
                .pipe(
                    tap(l => this.currentList = l.name),
                    mergeMap(l => this.listManager.upgradeList(l)),
                    switchMap((l: List) => this.listService.set(l.$key, l))
                );
        });
        this.subscriptions.push(
            concat(...regenerations)
                .pipe(
                    tap(() => {
                        done++;
                        this.progress = Math.ceil(100 * done / this.data.length);
                    }),
                    filter(() => this.progress >= 100)
                ).subscribe(() => {
                this.dialogRef.close();
            })
        )
        ;
    }

}
