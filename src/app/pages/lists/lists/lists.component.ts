import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../../model/list/list';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {UserInfo} from 'firebase/app';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {ListService} from '../../../core/database/list.service';
import {Observable} from 'rxjs/Observable';
import {MathTools} from '../../../tools/math-tools';
import {Title} from '@angular/platform-browser';
import {AlarmService} from '../../../core/time/alarm.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {ListTag} from '../../../model/list/list-tag.enum';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MergeListsPopupComponent} from '../merge-lists-popup/merge-lists-popup.component';
import {BulkRegeneratePopupComponent} from '../bulk-regenerate-popup/bulk-regenerate-popup.component';
import {WorkshopService} from '../../../core/database/workshop.service';
import {Workshop} from '../../../model/other/workshop';
import {TranslateService} from '@ngx-translate/core';

declare const ga: Function;

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss']
})
export class ListsComponent extends ComponentWithSubscriptions implements OnInit {

    reloader$ = new BehaviorSubject<void>(null);

    lists: Observable<{ basicLists: List[], rows?: { [index: string]: List[] } }>;

    tags: string[] = Object.keys(ListTag);

    tagFilter: BehaviorSubject<string[]> = new BehaviorSubject([]);

    user: UserInfo;

    newListFormControl = new FormControl('', Validators.required);

    @ViewChild('f') myNgForm;

    expanded: string[] = [];

    loading = true;

    workshops: Observable<Workshop[]>;

    constructor(private auth: AngularFireAuth, private alarmService: AlarmService,
                private dialog: MatDialog, private listManager: ListManagerService,
                private listService: ListService, private title: Title, private cd: ChangeDetectorRef,
                private workshopService: WorkshopService, private snack: MatSnackBar, private translator: TranslateService) {
        super();
    }

    createNewList(): void {
        if (this.newListFormControl.valid) {
            const list = new List();
            list.name = this.newListFormControl.value;
            list.authorId = this.user.uid;
            this.listService.add(list).first().subscribe(() => {
                this.newListFormControl.reset();
                this.myNgForm.resetForm();
            });
        }
    }

    newWorkshop(): void {
        const workshop = new Workshop();
        workshop.name = 'Test workshop';
        workshop.authorId = this.user.uid;
        this.workshopService.add(workshop);
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('WORKSHOP.Share_link_copied'),
            '', {
                duration: 10000,
                extraClasses: ['snack']
            });
    }

    getLink(workshop: Workshop): string {
        return `${window.location.protocol}//${window.location.host}/workshop/${workshop.$key}`;
    }

    regenerateAllLists(): void {
        this.lists.first().subscribe(lists => {
            this.dialog.open(BulkRegeneratePopupComponent, {data: lists, disableClose: true});
        });
    }

    deleteWorkshop(workshop: Workshop): void {
        this.workshopService.remove(workshop.$key).subscribe(() => {
            this.reloader$.next(null);
        });
    }

    delete(list: List): void {
        const dialogRef = this.dialog.open(ConfirmationPopupComponent);
        this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                list.forEachItem(row => {
                    if (this.alarmService.hasAlarm(row.id)) {
                        this.alarmService.unregister(row.id);
                    }
                });
                this.listService.remove(list.$key).subscribe(() => {
                    ga('send', 'event', 'List', 'deletion');
                    this.title.setTitle('Teamcraft');
                });
            }
        }));
    }

    openMergeListsPopup(): void {
        this.lists.first().subscribe(lists => {
            this.dialog.open(MergeListsPopupComponent, {data: {lists: lists, authorId: this.user.uid}}).afterClosed();
        });
    }

    removeRecipe(recipe: any, list: List, key: string): void {
        this.cd.detach();
        this.subscriptions.push(this.listManager
            .addToList(recipe.id, list, recipe.recipeId, -recipe.amount)
            .subscribe(resultList => {
                this.listService.set(key, resultList);
                this.cd.reattach();
            }));
    }

    updateAmount(recipe: any, list: List, key: string, amount: number): void {
        this.cd.detach();
        this.subscriptions.push(this.listManager
            .addToList(recipe.id, list, recipe.recipeId, MathTools.round(amount - recipe.amount))
            .subscribe(resultList => {
                this.listService.set(key, resultList);
                this.cd.reattach();
            }));
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

    ngOnInit() {
        this.subscriptions.push(
            this.auth.authState.subscribe(user => {
                if (user === null) {
                    this.lists = this.reloader$.switchMap(() => Observable.of({basicLists: []}));
                    this.user = undefined;
                    this.workshops = this.reloader$.switchMap(() => Observable.of([]));
                } else {
                    this.user = user;
                    this.workshops = this.workshopService.getUserWorkshops(user.uid);
                    this.lists = this.reloader$.switchMap(() => Observable.combineLatest(this.listService.getUserLists(user.uid),
                        this.tagFilter, (lists, tagFilter) => {
                            if (tagFilter.length === 0) {
                                return lists;
                            }
                            return lists.filter(list => {
                                let match = true;
                                tagFilter.forEach(tag => {
                                    match = match && list.tags.indexOf(ListTag[tag]) > -1;
                                });
                                return match;
                            });
                        })).mergeMap(lists => {
                        return this.workshops.map(workshops => {
                            const result = {basicLists: lists, rows: {}};
                            workshops.forEach(workshop => {
                                result.rows[workshop.$key] = [];
                                result.basicLists.forEach((list, index) => {
                                    // If this list is in this workshop.
                                    if (workshop.listIds !== undefined && workshop.listIds.indexOf(list.$key) > -1) {
                                        result.rows[workshop.$key].push(list);
                                        // Remove the list from basicLists.
                                        result.basicLists.splice(index, 1);
                                    }
                                });
                            });
                            return result;
                        });
                    }).do(() => this.loading = false);
                }
            }));
    }

}
