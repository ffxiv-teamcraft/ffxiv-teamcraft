import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../../model/list/list';
import {ActivatedRoute, Router} from '@angular/router';
import {ListRow} from '../../../model/list/list-row';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
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
import {SettingsService} from '../../settings/settings.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ListTagsPopupComponent} from '../list-tags-popup/list-tags-popup.component';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/distinctUntilChanged';
import {PageComponent} from '../../../core/component/page-component';
import {ComponentType} from '@angular/cdk/portal';
import {HelpService} from '../../../core/component/help.service';
import {ListHelpComponent} from '../list-help/list-help.component';
import {LayoutService} from '../../../core/layout/layout.service';
import {LayoutRowDisplay} from '../../../core/layout/layout-row-display';
import {ListLayoutPopupComponent} from '../list-layout-popup/list-layout-popup.component';

declare const ga: Function;

@Component({
    selector: 'app-list',
    templateUrl: './list-details.component.html',
    styleUrls: ['./list-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailsComponent extends PageComponent implements OnInit, OnDestroy {

    list: Observable<List>;

    listDisplay: Observable<LayoutRowDisplay[]>;

    private reload$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    user: UserInfo;

    listUid: string;

    authorUid: string;

    userData: AppUser;

    pricingMode = false;

    gatheringFilters = [];

    craftFilters = [];

    hideCompleted = false;

    etime: Date = this.eorzeanTimeService.toEorzeanDate(new Date());

    private filterTrigger = new BehaviorSubject<void>(null);

    notFound = false;

    accordionState: { [index: string]: boolean } = {
        'Crystals': false,
        'Gathering': false,
        'Other': false,
        'Pre_crafts': false,
        'Items': true
    };

    constructor(private auth: AngularFireAuth, private route: ActivatedRoute,
                protected dialog: MatDialog, private userService: UserService,
                private listService: ListService, private title: Title,
                private listManager: ListManagerService, private snack: MatSnackBar,
                private translate: TranslateService, private router: Router,
                private eorzeanTimeService: EorzeanTimeService, private data: LocalizedDataService,
                public settings: SettingsService, help: HelpService, private layoutService: LayoutService) {
        super(dialog, help);
        this.initFilters();
    }

    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return ListHelpComponent;
    }

    togglePublic(): void {
        this.subscriptions.push(this.list.first().subscribe(list => {
            list.public = !list.public;
            this.update(list);
        }));
    }

    public getUser(): Observable<User> {
        return this.auth.authState;
    }

    public openTimerOptionsPopup(): void {
        this.dialog.open(TimerOptionsPopupComponent);
    }

    public adaptFilters(): void {
        this.subscriptions.push(this.userService.getCharacter()
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
            }));
    }

    public triggerFilter(): void {
        this.filterTrigger.next(null);
    }

    public checkAll(checked: boolean): void {
        this.craftFilters.forEach(f => f.checked = checked);
        this.gatheringFilters.forEach(f => f.checked = checked);
        this.triggerFilter();
    }

    ngOnInit() {
        super.ngOnInit();

        this.subscriptions.push(this.eorzeanTimeService.getEorzeanTime().subscribe(date => this.etime = date));

        this.subscriptions.push(
            this.route.params.subscribe(params => {
                this.listUid = params.listId;
                this.list =
                    Observable.combineLatest(
                        this.filterTrigger,
                        this.listService.get(this.listUid),
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
                                    // If the item can't be filtered based on a gathering/crafting job level,
                                    // we want to reset its hidden state.
                                    item.hidden = false;
                                }
                                if (item.done >= item.amount && this.hideCompleted) {
                                    item.hidden = true;
                                }
                            });
                            return list;
                        })
                        .catch(() => {
                            this.notFound = true;
                            return Observable.of(null);
                        })
                        .distinctUntilChanged()
                        .filter(list => list !== null)
                        .do(l => {
                            if (l.name !== undefined) {
                                this.title.setTitle(`${l.name}`);
                            } else {
                                this.title.setTitle(this.translate.instant('List_not_found'));
                            }
                        })
                        .map((list: List) => {
                            list.crystals = list.orderCrystals();
                            list.gathers = list.orderGatherings(this.data);
                            return list;
                        });
                this.listDisplay = this.reload$.switchMap(() =>
                    this.list.map((list: List) => {
                        return this.layoutService.getDisplay(list);
                    }));
            }));
        this.subscriptions.push(this.auth.authState.subscribe(user => {
            this.user = user;
        }));
        this.subscriptions.push(this.userService.getUserData()
            .subscribe(user => {
                this.userData = user;
            }));
    }

    isOwnList(): boolean {
        return this.user !== undefined && this.user !== null && this.user.uid === this.authorUid;
    }

    upgradeList(): void {
        const dialogRef = this.dialog.open(RegenerationPopupComponent, {disableClose: true});
        this.list.switchMap(l => {
            return this.listManager.upgradeList(l)
                .switchMap(list => this.listService.update(this.listUid, list))
        }).first().subscribe(() => {
            ga('send', 'event', 'List', 'regenerate');
            dialogRef.close();
            this.snack.open(this.translate.instant('List_recreated'), '', {duration: 2000});
        });
    }

    openLayoutOptions(): void {
        this.dialog.open(ListLayoutPopupComponent).afterClosed().subscribe(() => {
            this.reload$.next(null);
        });
    }

    ngOnDestroy(): void {
        this.title.setTitle('Teamcraft');
        super.ngOnDestroy();
    }

    update(list: List): void {
        this.listService.update(this.listUid, list).first().subscribe(() => {
            // Ignored.
        });
    }

    set(list: List): void {
        this.listService.set(this.listUid, list).first().subscribe(() => {
            // Ignored.
        });
    }

    toggleFavorite(): void {
        if (this.userData.favorites === null || this.userData.favorites === undefined) {
            this.userData.favorites = [];
        }
        if (!this.isFavorite()) {
            this.userData.favorites.push(`${this.authorUid}/${this.listUid}`);
        } else {
            this.userData.favorites =
                this.userData.favorites.filter(row => row !== `${this.authorUid}/${this.listUid}`);
        }
        this.userService.update(this.user.uid, this.userData);
    }

    isFavorite(): boolean {
        if (this.userData === undefined || this.userData.favorites === undefined) {
            return false;
        }
        return Object.keys(this.userData.favorites)
            .map(key => this.userData.favorites[key])
            .indexOf(`${this.authorUid}/${this.listUid}`) > -1;
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
        // Update the forks count.
        this.listService.update(list.$key, list).first().subscribe();
        fork.authorId = this.user.uid;
        this.listService.add(fork).first().subscribe((id) => {
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
                .switchMap(() => {
                    return this.list.first();
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

    public rename(): void {
        this.subscriptions.push(
            this.list.first().switchMap(list => {
                const dialog = this.dialog.open(NameEditPopupComponent, {data: list.name});
                return dialog.afterClosed().map(value => {
                    if (value !== undefined && value.length > 0) {
                        list.name = value;
                    }
                    return list;
                });
            }).subscribe((list) => {
                this.update(list);
            })
        );
    }

    public openTagsPopup(): void {
        this.subscriptions.push(
            this.list.first().switchMap(list => {
                return this.dialog.open(ListTagsPopupComponent, {data: list}).afterClosed().map(tags => {
                    list.tags = tags;
                    return list;
                });
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
