import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../../model/list/list';
import {Router} from '@angular/router';
import {ListRow} from '../../../model/list/list-row';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {Observable} from 'rxjs/Observable';
import {UserService} from 'app/core/database/user.service';
import {ListService} from '../../../core/database/list.service';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {TranslateService} from '@ngx-translate/core';
import {RegenerationPopupComponent} from '../regeneration-popup/regeneration-popup.component';
import {AppUser} from 'app/model/list/app-user';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {TimerOptionsPopupComponent} from '../timer-options-popup/timer-options-popup.component';
import {NameEditPopupComponent} from '../../../modules/common-components/name-edit-popup/name-edit-popup.component';
import {User, UserInfo} from 'firebase';
import {SettingsService} from '../../settings/settings.service';
import {ListTagsPopupComponent} from '../list-tags-popup/list-tags-popup.component';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/distinctUntilChanged';
import {LayoutService} from '../../../core/layout/layout.service';
import {LayoutRowDisplay} from '../../../core/layout/layout-row-display';
import {ListLayoutPopupComponent} from '../list-layout-popup/list-layout-popup.component';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';

declare const ga: Function;

@Component({
    selector: 'app-list-details',
    templateUrl: './list-details.component.html',
    styleUrls: ['./list-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailsComponent extends ComponentWithSubscriptions implements OnInit, OnDestroy, OnChanges {

    @Input()
    listData: List;

    @Input()
    notFound = false;

    listDisplay: LayoutRowDisplay[];

    user: UserInfo;

    userData: AppUser;

    pricingMode = false;

    gatheringFilters = [];

    craftFilters = [];

    hideCompleted = false;

    hideUsed = false;

    etime: Date = this.eorzeanTimeService.toEorzeanDate(new Date());

    outdated = false;

    accordionState: { [index: string]: boolean } = {
        'Crystals': true,
        'Gathering': true,
        'Other': true,
        'Pre_crafts': true,
        'Items': false
    };

    @Output()
    reload: EventEmitter<void> = new EventEmitter<void>();

    constructor(private auth: AngularFireAuth, private userService: UserService, protected dialog: MatDialog,
                private listService: ListService, private listManager: ListManagerService, private snack: MatSnackBar,
                private translate: TranslateService, private router: Router, private eorzeanTimeService: EorzeanTimeService,
                public settings: SettingsService, private layoutService: LayoutService, private cd: ChangeDetectorRef) {
        super();
        this.initFilters();
    }

    displayTrackByFn(index: number, item: LayoutRowDisplay) {
        return item.filterChain;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.updateDisplay();
    }

    private updateDisplay(): void {
        if (this.listData !== undefined && this.listData !== null) {
            this.listData.forEachItem(item => {
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
                    // If the item can't be filtered based on a gathering/crafting job level,
                    // we want to reset its hidden state.
                    item.hidden = false;
                }
                if (item.done >= item.amount && this.hideCompleted) {
                    item.hidden = true;
                }
                // Hide when used
                if (item.used >= item.amount_needed && this.hideUsed) {
                    item.hidden = true;
                }
            });
            if (this.accordionState === undefined) {
                this.initAccordion(this.listData);
            }
            this.listDisplay = this.layoutService.getDisplay(this.listData);
            this.outdated = this.listData.isOutDated();
        }
    }

    private initAccordion(list: List): void {
        const listIsLarge = list.isLarge();
        this.accordionState = {
            'Crystals': !listIsLarge,
            'Gathering': !listIsLarge,
            'Other': !listIsLarge,
            'Pre_crafts': !listIsLarge,
            'Items': listIsLarge
        };
    }

    togglePublic(): void {
        this.listData.public = !this.listData.public;
        this.update(this.listData);
    }

    public getUser(): Observable<User> {
        return this.auth.authState;
    }

    public openTimerOptionsPopup(): void {
        this.dialog.open(TimerOptionsPopupComponent);
    }

    public adaptFilters(): void {
        this.userService.getCharacter()
            .first()
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
        this.reloadList();
        this.updateDisplay();
    }

    public checkAll(checked: boolean): void {
        this.craftFilters.forEach(f => f.checked = checked);
        this.gatheringFilters.forEach(f => f.checked = checked);
        this.triggerFilter();
    }

    private reloadList(): void {
        this.reload.emit();
    }

    ngOnInit() {
        this.subscriptions.push(this.eorzeanTimeService.getEorzeanTime().subscribe(date => this.etime = date));

        this.subscriptions.push(this.auth.authState.subscribe(user => {
            this.user = user;
        }));
        this.subscriptions.push(this.userService.getUserData()
            .subscribe(user => {
                this.userData = user;
            }));
    }

    isOwnList(): boolean {
        return this.user !== undefined && this.user !== null && this.user.uid === this.listData.authorId;
    }

    upgradeList(): void {
        const dialogRef = this.dialog.open(RegenerationPopupComponent, {disableClose: true});
        this.cd.detach();
        this.listManager.upgradeList(this.listData)
            .switchMap(list => this.listService.update(this.listData.$key, list)).first().subscribe(() => {
            ga('send', 'event', 'List', 'regenerate');
            this.cd.reattach();
            dialogRef.close();
            this.snack.open(this.translate.instant('List_recreated'), '', {duration: 2000});
        });
    }

    openLayoutOptions(): void {
        this.dialog.open(ListLayoutPopupComponent).afterClosed().subscribe(() => {
            this.reload.emit();
            this.listDisplay = this.layoutService.getDisplay(this.listData);
        });
    }

    update(list: List): void {
        console.log('update', list);
        this.listService.update(this.listData.$key, list).first().subscribe(() => {
            this.reload.emit();
        });
    }

    set(list: List): void {
        this.listService.set(this.listData.$key, list).first().subscribe(() => {
        });
    }

    toggleFavorite(): void {
        if (this.userData.favorites === null || this.userData.favorites === undefined) {
            this.userData.favorites = [];
        }
        if (!this.isFavorite()) {
            this.userData.favorites.push(`${this.listData.authorId}/${this.listData.$key}`);
        } else {
            this.userData.favorites =
                this.userData.favorites.filter(row => row !== `${this.listData.authorId}/${this.listData.$key}`);
        }
        this.userService.update(this.user.uid, this.userData);
    }

    isFavorite(): boolean {
        if (this.userData === undefined || this.userData.favorites === undefined) {
            return false;
        }
        return Object.keys(this.userData.favorites)
            .map(key => this.userData.favorites[key])
            .indexOf(`${this.listData.authorId}/${this.listData.$key}`) > -1;
    }

    public setDone(list: List, data: { row: ListRow, amount: number, preCraft: boolean }): void {
        list.setDone(data.row, data.amount, data.preCraft);
        this.listService.update(list.$key, list).map(() => list)
            .do(l => {
                if (l.ephemeral && l.isComplete()) {
                    this.listService.remove(list.$key).first().subscribe(() => {
                        this.router.navigate(['recipes']);
                    });
                }
            }).subscribe(() => {
        });
    }

    public forkList(list: List): void {
        const fork: List = list.clone();
        this.cd.detach();
        // Update the forks count.
        this.listService.update(list.$key, list).first().subscribe();
        fork.authorId = this.user.uid;
        this.listService.add(fork).first().subscribe((id) => {
            this.cd.reattach();
            this.subscriptions.push(this.snack.open(this.translate.instant('List_forked'),
                this.translate.instant('Open')).onAction()
                .subscribe(() => {
                    this.listService.getRouterPath(id)
                        .subscribe(path => {
                            this.router.navigate(path);
                        });
                }));
        });
    }

    public resetProgression(): void {
        this.subscriptions.push(
            this.dialog.open(ConfirmationPopupComponent).afterClosed()
                .filter(r => r)
                .map(() => {
                    return this.listData;
                })
                .subscribe(list => {
                    for (const recipe of list.recipes) {
                        list.resetDone(recipe);
                    }
                    this.set(list);
                }));
    }

    public toggleHideCompleted(): void {
        this.hideCompleted = !this.hideCompleted;
        this.triggerFilter();
    }

    public toggleHideUsed(): void {
        this.hideUsed = !this.hideUsed;
        this.triggerFilter();
    }

    public rename(): void {
        const dialog = this.dialog.open(NameEditPopupComponent, {data: this.listData.name});
        this.subscriptions.push(dialog.afterClosed().map(value => {
                if (value !== undefined && value.length > 0) {
                    this.listData.name = value;
                }
                return this.listData;
            }).subscribe((list) => {
                this.update(list);
            })
        );
    }

    public openTagsPopup(): void {
        this.subscriptions.push(
            this.dialog.open(ListTagsPopupComponent, {data: this.listData}).afterClosed().map(tags => {
                this.listData.tags = tags;
                return this.listData;
            })
                .filter(list => list.tags !== undefined)
                .subscribe(list => {
                    this.update(list);
                })
        );
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
