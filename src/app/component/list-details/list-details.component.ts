import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../model/list/list';
import {User, UserInfo} from 'firebase/app';
import {ActivatedRoute} from '@angular/router';
import {ListRow} from '../../model/list/list-row';
import {MdDialog, MdSnackBar} from '@angular/material';
import {ConfirmationPopupComponent} from '../popup/confirmation-popup/confirmation-popup.component';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {UserService} from 'app/core/user.service';
import {ListService} from '../../core/firebase/list.service';
import {Title} from '@angular/platform-browser';
import {ListManagerService} from '../../core/list/list-manager.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-list',
    templateUrl: './list-details.component.html',
    styleUrls: ['./list-details.component.scss']
})
export class ListDetailsComponent implements OnInit, OnDestroy {

    listObj: Observable<List>;

    list: List;

    user: UserInfo;

    listUid: string;

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

    constructor(private auth: AngularFireAuth, private route: ActivatedRoute,
                private dialog: MdDialog, private userService: UserService,
                private listService: ListService, private title: Title,
                private listManager: ListManagerService, private snack: MdSnackBar,
                private translate: TranslateService) {
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
            this.listUid = params.listId;
            this.listObj = this.listService.getUserList(params.uid, this.listUid);
            Observable.combineLatest(
                this.filterTrigger,
                this.listObj,
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
                })
                .do(l => this.title.setTitle(`${l.name}`))
                .subscribe(l => this.list = l, err => console.error(err));
        });
        this.triggerFilter();
        this.auth.idToken.subscribe(user => {
            this.user = user;
        });
    }

    upgradeList(): void {
        this.listManager.upgradeList(this.list)
            .mergeMap(list => this.listService.update(this.list.$key, list))
            .debounceTime(3000)
            .subscribe(() => {
                this.snack.open(this.translate.instant('List_recreated'));
            });
    }

    ngOnDestroy(): void {
        this.title.setTitle('Teamcraft');
    }

    update(): void {
        this.listService.update(this.listUid, this.list);
    }

    public setDone(data: { row: ListRow, amount: number }): void {
        this.list.setDone(data.row, data.amount);
        this.listService.update(this.listUid, this.list);
    }

    public resetProgression(): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed().subscribe(res => {
            if (res) {
                for (const recipe of this.list.recipes) {
                    this.list.resetDone(recipe);
                    this.listService.update(this.listUid, this.list);
                }
            }
        });
    }
}
