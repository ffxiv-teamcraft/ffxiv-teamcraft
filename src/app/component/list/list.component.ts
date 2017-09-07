import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import {List} from '../../model/list';
import {UserInfo, User} from 'firebase/app';
import {ActivatedRoute} from '@angular/router';
import {ListRow} from '../../model/list-row';
import {ListManagerService} from '../../core/list/list-manager.service';
import {MdDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../popup/confirmation-popup/confirmation-popup.component';
import {I18nToolsService} from '../../core/i18n-tools.service';
import {I18nName} from '../../model/i18n-name';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {UserService} from 'app/core/user.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

    listObj: FirebaseObjectObservable<List>;

    list: List;

    user: UserInfo;

    gatheringFilters = [
        {job: 'BTN', level: 70, checked: true, name: 'botanist'},
        {job: 'MIN', level: 70, checked: true, name: 'miner'},
        {job: 'FSH', level: 70, checked: true, name: 'fisher'}
    ];

    craftFilters = [
        {job: 'ALC', level: 70, checked: true, name: 'alchemist'},
        {job: 'ARM', level: 70, checked: true, name: 'armorer'},
        {job: 'BSM', level: 70, checked: true, name: 'blacksmith'},
        {job: 'CRP', level: 70, checked: true, name: 'carpenter'},
        {job: 'CUL', level: 70, checked: true, name: 'culinarian'},
        {job: 'GSM', level: 70, checked: true, name: 'goldsmith'},
        {job: 'LTW', level: 70, checked: true, name: 'leatherworker'},
        {job: 'WVR', level: 70, checked: true, name: 'weaver'}
    ];

    private filterTrigger = new Subject<void>();

    constructor(private route: ActivatedRoute, private af: AngularFireDatabase,
                private auth: AngularFireAuth, private listManager: ListManagerService,
                private dialog: MdDialog, private i18n: I18nToolsService,
                private userService: UserService) {
    }

    public getUser(): Observable<User> {
        return this.auth.authState;
    }

    public adaptFilters(): void {
        this.userService.getUser()
            .map(u => <any>u)
            .subscribe(u => {
                this.craftFilters.forEach(filter => {
                    const userJob = u.classjobs[filter.name];
                    if (userJob === undefined) {
                        filter.checked = false;
                    } else {
                        filter.checked = true;
                        filter.level = userJob.level;
                    }
                });
                this.gatheringFilters.forEach(filter => {
                    const userJob = u.classjobs[filter.name];
                    if (userJob === undefined) {
                        filter.checked = false;
                    } else {
                        filter.checked = true;
                        filter.level = userJob.level;
                    }
                });
                this.triggerFilter();
            });
    }

    public triggerFilter(): void {
        this.filterTrigger.next();
    }

    public checkAll(checked: boolean): void {
        this.craftFilters.forEach(f => f.checked = checked);
        this.gatheringFilters.forEach(f => f.checked = checked);
        this.triggerFilter();
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.listObj = this.af.object(`/users/${params.uid}/lists/${params.listId}`);
            Observable.combineLatest(
                this.filterTrigger,
                this.listObj.map(obj => {
                    const list = new List();
                    list.name = obj.name;
                    list.createdAt = obj.createdAt;
                    list.crystals = obj.crystals;
                    list.gathers = obj.gathers;
                    list.others = obj.others;
                    list.preCrafts = obj.preCrafts;
                    list.recipes = obj.recipes;
                    return list;
                }),
                (ignored, list) => {
                    list.forEachItem(item => {
                        if (item.gatheredBy !== undefined) {
                            const filter = this.gatheringFilters.find(f => item.gatheredBy.icon.indexOf(f.job) > -1);
                            item.hidden = !filter.checked || item.gatheredBy.level > filter.level;
                        }
                        if (item.craftedBy !== undefined) {
                            for (const craft of item.craftedBy) {
                                const filter = this.craftFilters.find(f => craft.icon.indexOf(f.name) > -1);
                                item.hidden = !filter.checked || craft.level > filter.level;
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
