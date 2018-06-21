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
import {Observable, of, ReplaySubject} from 'rxjs';
import {UserService} from 'app/core/database/user.service';
import {ListService} from '../../../core/database/list.service';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {TranslateService} from '@ngx-translate/core';
import {RegenerationPopupComponent} from '../regeneration-popup/regeneration-popup.component';
import {AppUser} from 'app/model/list/app-user';
import {EorzeanTimeService} from '../../../core/time/eorzean-time.service';
import {TimerOptionsPopupComponent} from '../timer-options-popup/timer-options-popup.component';
import {NameEditPopupComponent} from '../../../modules/common-components/name-edit-popup/name-edit-popup.component';
import {User} from 'firebase';
import {SettingsService} from '../../settings/settings.service';
import {ListTagsPopupComponent} from '../list-tags-popup/list-tags-popup.component';
import {LayoutService} from '../../../core/layout/layout.service';
import {LayoutRowDisplay} from '../../../core/layout/layout-row-display';
import {ListLayoutPopupComponent} from '../list-layout-popup/list-layout-popup.component';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {PermissionsPopupComponent} from '../../../modules/common-components/permissions-popup/permissions-popup.component';
import {ListFinishedPopupComponent} from '../list-finished-popup/list-finished-popup.component';
import {filter, first, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {PlatformService} from '../../../core/tools/platform.service';
import {LinkToolsService} from '../../../core/tools/link-tools.service';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {LocalizedDataService} from '../../../core/data/localized-data.service';

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

    listData$: ReplaySubject<List> = new ReplaySubject<List>();

    listDisplay: Observable<LayoutRowDisplay[]>;

    recipes: Observable<ListRow[]>;

    user: User;

    userData: AppUser;

    pricingMode = false;

    gatheringFilters = [];

    craftFilters = [];

    hideCompleted = false;

    hideUsed = false;

    etime: Date = this.eorzeanTimeService.toEorzeanDate(new Date());

    clock: Observable<Date>;

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

    private completionDialogOpen = false;

    private upgradingList = false;

    public get selectedIndex(): number {
        return +(localStorage.getItem('layout:selected') || 0);
    }

    constructor(private auth: AngularFireAuth, private userService: UserService, protected dialog: MatDialog,
                private listService: ListService, private listManager: ListManagerService, private snack: MatSnackBar,
                private translate: TranslateService, private router: Router, private eorzeanTimeService: EorzeanTimeService,
                public settings: SettingsService, private layoutService: LayoutService, private cd: ChangeDetectorRef,
                public platform: PlatformService, private linkTools: LinkToolsService, private l12n: LocalizedDataService,
                private i18nTools: I18nToolsService) {
        super();
        this.initFilters();
        this.listDisplay = this.listData$
            .pipe(
                filter(data => data !== null),
                mergeMap(data => {
                    return this.layoutService.getDisplay(data, this.selectedIndex);
                })
            );
        this.recipes = this.listData$
            .pipe(
                filter(data => data !== null),
                mergeMap(data => {
                    return this.layoutService.getRecipes(data, this.selectedIndex);
                })
            );
    }

    public getLink(): string {
        return this.linkTools.getLink(`/list/${this.listData.$key}`);
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translate.instant('Share_link_copied'),
            '', {
                duration: 10000,
                panelClass: ['snack']
            });
    }

    displayTrackByFn(index: number, item: LayoutRowDisplay) {
        return item.filterChain;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.updateDisplay();
        this.listData$.next(this.listData);
    }

    private updateDisplay(): void {
        if (this.listData !== undefined && this.listData !== null) {
            // We are using setTimeout here to avoid creating a new dialog box during change detection cycle.
            setTimeout(() => {
                if (!this.upgradingList && this.listData.isOutDated() && this.userData !== undefined
                    && this.listData.authorId === this.userData.$key) {
                    this.upgradeList();
                }
            }, 50);
            this.listData.forEachItem(item => {
                if (item.gatheredBy !== undefined) {
                    const gatheringFilter = this.gatheringFilters.find(f => f.types.indexOf(item.gatheredBy.type) > -1);
                    if (gatheringFilter !== undefined) {
                        item.hidden = !gatheringFilter.checked || item.gatheredBy.level > gatheringFilter.level;
                    }
                } else if (item.craftedBy !== undefined) {
                    for (const craft of item.craftedBy) {
                        const craftFilter = this.craftFilters.find(f => craft.icon.indexOf(f.name) > -1);
                        item.hidden = !craftFilter.checked || craft.level > craftFilter.level;
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
            this.listData$.next(this.listData);
            if (this.accordionState === undefined) {
                this.initAccordion(this.listData);
            }
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
            .pipe(
                first(),
                map(u => <any>u),
            )
            .subscribe(u => {
                this.craftFilters.forEach(craftFilter => {
                    const userJob = u.classjobs[craftFilter.name];
                    if (userJob === undefined) {
                        craftFilter.checked = false;
                    } else {
                        craftFilter.checked = true;
                        craftFilter.level = userJob.level;
                    }
                });
                this.gatheringFilters.forEach(gatheringFilter => {
                    const userJob = u.classjobs[gatheringFilter.name];
                    if (userJob === undefined) {
                        gatheringFilter.checked = false;
                    } else {
                        gatheringFilter.checked = true;
                        gatheringFilter.level = userJob.level;
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
        this.clock = this.eorzeanTimeService.getEorzeanTime();

        this.subscriptions.push(this.auth.authState.subscribe(user => {
            this.user = user;
        }));
        this.subscriptions.push(this.userService.getUserData()
            .subscribe(user => {
                this.userData = user;
                this.hideUsed = user.listDetailsFilters !== undefined ? user.listDetailsFilters.hideUsed : false;
                this.hideCompleted = user.listDetailsFilters !== undefined ? user.listDetailsFilters.hideCompleted : false;
                this.triggerFilter();
            }));
        this.listData$.next(this.listData);
    }

    isOwnList(): boolean {
        if (this.listData === null) {
            return false;
        }
        return this.user !== undefined && this.user !== null && this.user.uid === this.listData.authorId;
    }

    public getTextExport(display: LayoutRowDisplay[]): string {
        return display
            .filter(displayRow => displayRow.rows.length > 0)
            .reduce((exportString, displayRow) => {
                return exportString + displayRow.rows.reduce((rowExportString, row) => {
                    return rowExportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`
                }, `${this.translate.instant(displayRow.title)}:\n`) + '\n';
            }, `${this.linkTools.getLink(`list/${this.listData.$key}`)
                }\n\n${this.listData.name}: \n\n${
                this.getCrystalsTextExport(this.translate.instant('Crystals'), this.listData.crystals)}`);
    }

    public getCrystalsTextExport(title: string, crystals: ListRow[]): string {
        return crystals.reduce((exportString, row) => {
            return exportString + `${row.amount}x ${this.i18nTools.getName(this.l12n.getItem(row.id))}\n`
        }, `${title} :\n`);
    }

    upgradeList(): void {
        this.upgradingList = true;
        const dialogRef = this.dialog.open(RegenerationPopupComponent, {disableClose: true});
        this.cd.detach();
        this.listManager.upgradeList(this.listData)
            .pipe(
                switchMap(list => this.listService.set(this.listData.$key, list)),
                first()
            ).subscribe(() => {
            ga('send', 'event', 'List', 'regenerate');
            this.cd.reattach();
            dialogRef.close();
            this.snack.open(this.translate.instant('List_recreated'), '', {duration: 2000});
            this.upgradingList = false;
            this.reload.emit();
        });
    }

    openLayoutOptions(): void {
        this.dialog.open(ListLayoutPopupComponent).afterClosed().subscribe(() => {
            this.reload.emit();
            this.listDisplay = this.layoutService.getDisplay(this.listData, this.selectedIndex);
        });
    }

    update(list: List): void {
        this.listService.set(this.listData.$key, list).pipe(first()).subscribe(() => {
            this.reload.emit();
        });
    }

    set(list: List): void {
        this.listService.set(this.listData.$key, list).pipe(first()).subscribe(() => {
            this.reload.emit();
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
        if (this.userData === undefined || this.userData.favorites === undefined || this.listData === null) {
            return false;
        }
        return Object.keys(this.userData.favorites)
            .map(key => this.userData.favorites[key])
            .indexOf(`${this.listData.authorId}/${this.listData.$key}`) > -1;
    }

    public setDone(list: List, data: { row: ListRow, amount: number, preCraft: boolean }): void {
        list.setDone(data.row, data.amount, data.preCraft);
        this.listService.set(list.$key, list).pipe(
            map(() => list),
            tap((l: List) => {
                if (l.ephemeral && l.isComplete()) {
                    this.listService.remove(list.$key).pipe(first()).subscribe(() => {
                        this.router.navigate(['recipes']);
                    });
                } else if (l.isComplete() && !l.public) {
                    this.onCompletion(list);
                }
            })
        ).subscribe();
    }

    private onCompletion(list: List): void {
        if (!this.completionDialogOpen && this.userData.$key === this.listData.authorId) {
            this.completionDialogOpen = true;
            this.dialog.open(ListFinishedPopupComponent)
                .afterClosed()
                .pipe(
                    tap(() => this.completionDialogOpen = false),
                    filter(res => res !== undefined),
                    mergeMap(res => {
                        switch (res) {
                            case 'reset':
                                this.resetProgression();
                                return of(null);
                            case 'delete':
                                return this.listService.remove(list.$key).pipe(first(),
                                    tap(() => {
                                        this.router.navigate(['recipes']);
                                    })
                                );
                            default:
                                return of(null)
                        }
                    })
                ).subscribe();
        }
    }

    public forkList(list: List): void {
        const fork: List = list.clone();
        this.cd.detach();
        // Update the forks count.
        this.listService.set(list.$key, list).pipe(first()).subscribe();
        fork.authorId = this.user.uid;
        this.listService.add(fork).pipe(first()).subscribe((id) => {
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
            this.dialog.open(ConfirmationPopupComponent, {data: 'Do you really want to reset the list?'}).afterClosed()
                .pipe(
                    filter(r => r),
                    map(() => {
                        return this.listData;
                    })
                )
                .subscribe(list => {
                    for (const recipe of list.recipes) {
                        list.resetDone(recipe);
                    }
                    this.set(list);
                })
        )
        ;
    }

    public toggleHideCompleted(): void {
        this.hideCompleted = !this.hideCompleted;
        this.userData.listDetailsFilters.hideCompleted = this.hideCompleted;
        this.userService.set(this.userData.$key, this.userData).pipe(first()).subscribe();
        this.triggerFilter();
    }

    public toggleHideUsed(): void {
        this.hideUsed = !this.hideUsed;
        this.userData.listDetailsFilters.hideUsed = this.hideUsed;
        this.userService.set(this.userData.$key, this.userData).pipe(first()).subscribe();
        this.triggerFilter();
    }

    public rename(): void {
        const dialog = this.dialog.open(NameEditPopupComponent, {data: this.listData.name});
        this.subscriptions.push(dialog.afterClosed()
            .pipe(
                map(value => {
                    if (value !== undefined && value.length > 0) {
                        this.listData.name = value;
                    }
                    return this.listData;
                })
            ).subscribe((list) => {
                this.update(list);
            })
        );
    }

    public openTagsPopup(): void {
        this.subscriptions.push(
            this.dialog.open(ListTagsPopupComponent, {data: this.listData}).afterClosed().pipe(
                map(tags => {
                    this.listData.tags = tags;
                    return this.listData;
                }),
                filter(list => list.tags !== undefined)
            ).subscribe(list => {
                this.update(list);
            })
        );
    }

    public openPermissionsPopup(): void {
        this.dialog.open(PermissionsPopupComponent, {data: this.listData})
            .afterClosed()
            .pipe(filter(list => list !== ''))
            .subscribe((list) => {
                this.update(list);
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
