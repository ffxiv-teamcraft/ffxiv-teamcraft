import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../../model/list/list';
import {ActivatedRoute, Router} from '@angular/router';
import {ListRow} from '../../../model/list/list-row';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {UserService} from 'app/core/database/user.service';
import {ListService} from '../../../core/database/list.service';
import {Title} from '@angular/platform-browser';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {TranslateService} from '@ngx-translate/core';
import {RegenerationPopupComponent} from '../regeneration-popup/regeneration-popup.component';
import {AppUser} from 'app/model/list/app-user';
import {ZoneBreakdown} from '../../../model/list/zone-breakdown';
import {I18nName} from '../../../model/list/i18n-name';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {TimerOptionsPopupComponent} from '../timer-options-popup/timer-options-popup.component';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {NameEditPopupComponent} from '../../../modules/common-components/name-edit-popup/name-edit-popup.component';
import {User, UserInfo} from 'firebase';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/do';
import {SettingsService} from '../../settings/settings.service';

declare const ga: Function;

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

    authorUid: string;

    userData: AppUser;

    zoneBreakdownToggle = false;

    pricingMode = false;

    gatheringFilters = [];

    craftFilters = [];

    hideCompleted = false;

    etime: Date = this.eorzeanTimeService.toEorzeanDate(new Date());

    private filterTrigger = new Subject<void>();

    zoneBreakdown: ZoneBreakdown;

    constructor(private auth: AngularFireAuth, private route: ActivatedRoute,
                private dialog: MatDialog, private userService: UserService,
                private listService: ListService, private title: Title,
                private listManager: ListManagerService, private snack: MatSnackBar,
                private translate: TranslateService, private router: Router,
                private eorzeanTimeService: EorzeanTimeService,
                private data: LocalizedDataService, public settings: SettingsService) {
        this.initFilters();

    }

    public getUser(): Observable<User> {
        return this.auth.authState;
    }

    public getLocation(id: number): I18nName {
        if (id === -1) {
            return {fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other'};
        }
        return this.data.getPlace(id);
    }

    public openTimerOptionsPopup(): void {
        this.dialog.open(TimerOptionsPopupComponent);
    }

    public adaptFilters(): void {
        this.userService.getCharacter()
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
        this.eorzeanTimeService.getEorzeanTime().subscribe(date => this.etime = date);

        this.route.params.subscribe(params => {
            this.listUid = params.listId;
            this.listObj = this.listService.get(this.listUid);
            Observable.combineLatest(
                this.filterTrigger,
                this.listObj,
                (ignored, list) => {
                    this.authorUid = list.authorId;
                    list.forEachItem(item => {
                        if (item.gatheredBy !== undefined) {
                            const filter = this.gatheringFilters.find(f => f.types.indexOf(item.gatheredBy.type) > -1);
                            if (filter !== undefined) {
                                item.hidden = !filter.checked || item.gatheredBy.level > filter.level;
                            }
                        } else if (item.craftedBy !== undefined) {
                            for (const craft of item.craftedBy) {
                                const filter = this.craftFilters.find(f => craft.icon.indexOf(f.name) > -1);
                                item.hidden = !filter.checked || craft.level > filter.level;
                            }
                        } else {
                            // If the item can't be filtered based on a gathering/crafting job level, we want to reset its hidden state.
                            item.hidden = false;
                        }
                        if (item.done >= item.amount && this.hideCompleted) {
                            item.hidden = true;
                        }
                    });
                    return list;
                })
                .distinctUntilChanged()
                .do(l => {
                    if (l.name !== undefined) {
                        this.title.setTitle(`${l.name}`);
                    } else {
                        this.title.setTitle(this.translate.instant('List_not_found'));
                    }
                }).subscribe(l => {
                this.list = l;
                this.zoneBreakdown = new ZoneBreakdown(l);
            }, err => console.error(err));
        });
        this.triggerFilter();
        this.auth.authState.subscribe(user => {
            this.user = user;
        });
        this.userService.getUserData()
            .subscribe(user => {
                this.userData = user;
            });
    }

    isOwnList(): boolean {
        return this.user !== undefined && this.user !== null && this.user.uid === this.authorUid;
    }

    upgradeList(): void {
        const dialogRef = this.dialog.open(RegenerationPopupComponent, {disableClose: true});
        this.listManager.upgradeList(this.list)
            .switchMap(list => this.listService.update(this.listUid, list))
            .subscribe(() => {
                ga('send', 'event', 'List', 'regenerate');
                dialogRef.close();
                this.snack.open(this.translate.instant('List_recreated'), '', {duration: 2000});
            });
    }

    ngOnDestroy(): void {
        this.title.setTitle('Teamcraft');
    }

    update(): void {
        this.listService.update(this.listUid, this.list, {uuid: this.authorUid});
    }

    toggleFavorite(): void {
        if (this.userData.favorites === null || this.userData.favorites === undefined) {
            this.userData.favorites = [];
        }
        if (!this.isFavorite()) {
            this.userData.favorites.push(`${this.authorUid}/${this.listUid}`);
            this.list.favorites.push(this.user.uid);
        } else {
            this.userData.favorites =
                this.userData.favorites.filter(row => row !== `${this.authorUid}/${this.listUid}`);
            this.list.favorites = this.list.favorites.filter(uuid => uuid !== this.user.uid);
        }
        this.userService.update(this.user.uid, this.userData);
        this.update();
    }

    isFavorite(): boolean {
        if (this.userData === undefined || this.userData.favorites === undefined) {
            return false;
        }
        return Object.keys(this.userData.favorites)
            .map(key => this.userData.favorites[key])
            .indexOf(`${this.authorUid}/${this.listUid}`) > -1;
    }

    public setDone(data: { row: ListRow, amount: number }, recipe: boolean = false): void {
        this.list.setDone(data.row, data.amount, recipe);
        this.update();
    }

    public forkList(): void {
        // Little trick to clone an object using JS.
        const fork = this.list.clone();
        this.listService.push(fork).then((id) => {
            this.snack.open(this.translate.instant('List_forked'),
                this.translate.instant('Open')).onAction()
                .subscribe(() => {
                    this.listService.getRouterPath(id)
                        .subscribe(path => {
                            this.router.navigate(path);
                        });
                });
        });
    }

    orderCrystals(crystals: ListRow[]): ListRow[] {
        return crystals === null ? null : crystals.sort((a, b) => a.id - b.id);
    }

    orderPreCrafts(preCrafts: ListRow[]): ListRow[] {
        return preCrafts === null ? null : preCrafts.sort((a: ListRow, b: ListRow) => {
            let aRequiredItems = 0;
            let bRequiredItems = 0;
            a.requires.forEach(requirement => {
                aRequiredItems += preCrafts.filter(pc => pc.id === requirement.id).length;
            });
            b.requires.forEach(requirement => {
                bRequiredItems += preCrafts.filter(pc => pc.id === requirement.id).length;
            });
            const result = aRequiredItems - bRequiredItems;
            // If we get 0 as result, the template will act in a strange way, moving items as we hover them, so we need a failsafe.
            if (result === 0) {
                return this.data.getItem(a.id).en > this.data.getItem(b.id).en ? 1 : -1;
            }
            return result;
        });
    }

    orderGatherings(gatherings: ListRow[]): ListRow[] {
        return gatherings.sort((a, b) => {
            if (this.data.getItem(b.id).en > this.data.getItem(a.id).en) {
                if (this.data.getItem(a.id).en > this.data.getItem(b.id).en) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                if (this.data.getItem(a.id).en > this.data.getItem(b.id).en) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
    }

    public resetProgression(): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed().subscribe(res => {
            if (res) {
                for (const recipe of this.list.recipes) {
                    this.list.resetDone(recipe);
                }
                this.update();
            }
        });
    }

    public toggleZoneBreakdown(): void {
        this.zoneBreakdownToggle = !this.zoneBreakdownToggle;
    }

    public toggleHideCompleted(): void {
        this.hideCompleted = !this.hideCompleted;
        this.triggerFilter();
    }

    public rename(): void {
        const dialog = this.dialog.open(NameEditPopupComponent, {data: this.list.name});
        dialog.afterClosed().subscribe(value => {
            if (value !== undefined && value.length > 0) {
                this.list.name = value;
                this.update();
            }
        });
    }

    protected resetFilters(): void {
        this.initFilters();

        this.triggerFilter();
    }

    private initFilters() {
        this.gatheringFilters = [
            {job: 'BTN', level: 70, checked: true, types: [2, 3], name: 'botanist'},
            {job: 'MIN', level: 70, checked: true, types: [0, 1], name: 'miner'},
            {job: 'FSH', level: 70, checked: true, types: [4], name: 'fisher'}
        ];

        this.craftFilters = [
            {job: 'ALC', level: 70, checked: true, name: 'alchemist'},
            {job: 'ARM', level: 70, checked: true, name: 'armorer'},
            {job: 'BSM', level: 70, checked: true, name: 'blacksmith'},
            {job: 'CRP', level: 70, checked: true, name: 'carpenter'},
            {job: 'CUL', level: 70, checked: true, name: 'culinarian'},
            {job: 'GSM', level: 70, checked: true, name: 'goldsmith'},
            {job: 'LTW', level: 70, checked: true, name: 'leatherworker'},
            {job: 'WVR', level: 70, checked: true, name: 'weaver'}
        ];

    }

}
