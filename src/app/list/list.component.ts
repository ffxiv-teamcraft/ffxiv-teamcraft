import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {List} from '../model/list';
import {UserInfo} from 'firebase/app';
import {ActivatedRoute} from '@angular/router';
import {ListRow} from '../model/list-row';
import {ListManagerService} from '../core/list-manager.service';
import {MdDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../confirmation-popup/confirmation-popup.component';
import {I18nTools} from '../core/i18n-tools';
import {I18nName} from '../model/i18n-name';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

    listObj: FirebaseObjectObservable<List>;

    list: List;

    user: UserInfo;

    constructor(private route: ActivatedRoute, private af: AngularFireDatabase,
                private auth: AngularFireAuth, private listManager: ListManagerService,
                private dialog: MdDialog, private i18n: I18nTools) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.listObj = this.af.object(`/lists/${params.uid}/${params.listId}`);
            this.listObj.subscribe(l => this.list = l, err => console.error(err));
        });
        this.auth.idToken.subscribe(user => {
            this.user = user;
        });
    }

    update(): void {
        this.listObj.update(this.list);
    }

    public setDone(data: { row: ListRow, amount: number}): void {
        this.listManager.setDone(data.row, data.amount, this.list);
        this.listObj.update(this.list);
    }

    public resetProgression(): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed().subscribe(res => {
            if (res) {
                for (const recipe of this.list.recipes) {
                    this.listManager.resetDone(recipe, this.list);
                    this.listObj.update(this.list);
                }
            }
        });
    }

    public getName(entry: I18nName): string {
        return this.i18n.getName(entry);
    }
}
