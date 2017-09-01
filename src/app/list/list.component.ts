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
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

    listObj: FirebaseObjectObservable<List>;

    list: List;

    user: UserInfo;

    levelFilter = {
        min: 1,
        max: 70
    };

    filters = [
        {job: 'BTN', checked: true},
        {job: 'MIN', checked: true},
        {job: 'FSH', checked: true},

        {job: 'ALC', checked: true},
        {job: 'ARM', checked: true},
        {job: 'BSM', checked: true},
        {job: 'CRP', checked: true},
        {job: 'CUL', checked: true},
        {job: 'GSM', checked: true},
        {job: 'LTW', checked: true},
        {job: 'WVR', checked: true}
    ];

    abbreviations = {
        ALC: 'alchemist',
        ARM: 'armorer',
        BSM: 'blacksmith',
        CRP: 'carpenter',
        CUL: 'culinarian',
        GSM: 'goldsmith',
        LTW: 'leatherworker',
        WVR: 'weaver',
    };

    private filterTrigger = new Subject<void>();

    constructor(private route: ActivatedRoute, private af: AngularFireDatabase,
                private auth: AngularFireAuth, private listManager: ListManagerService,
                private dialog: MdDialog, private i18n: I18nTools) {
    }

    public triggerFilter(): void {
        this.filterTrigger.next();
    }

    public checkAll(checked: boolean): void {
        this.filters.forEach(f => f.checked = checked);
        this.triggerFilter();
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.listObj = this.af.object(`/lists/${params.uid}/${params.listId}`);
            Observable.combineLatest(this.filterTrigger,
                this.listObj,
                (ignored, list) => {
                    this.listManager.forEachItem(list, item => {
                        if (item.gatheredBy !== undefined) {
                            item.hidden =
                                !this.filters.find(filter => item.gatheredBy.icon.indexOf(filter.job) > -1).checked
                                || item.gatheredBy.level < this.levelFilter.min
                                || item.gatheredBy.level > this.levelFilter.max;
                        }
                        if (item.craftedBy !== undefined) {
                            for (const craft of item.craftedBy) {
                                item.hidden = !this.filters.find(filter => craft.icon.indexOf(this.abbreviations[filter.job]) > -1).checked
                                    || craft.level < this.levelFilter.min
                                    || craft.level > this.levelFilter.max;
                            }
                        }
                    });
                    return list;
                }).subscribe(l => this.list = l, err => console.error(err));
        });
        this.triggerFilter();
        this.auth.idToken.subscribe(user => {
            this.user = user;
        });
    }

    update(): void {
        this.listObj.update(this.list);
    }

    public setDone(data: { row: ListRow, amount: number }): void {
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
