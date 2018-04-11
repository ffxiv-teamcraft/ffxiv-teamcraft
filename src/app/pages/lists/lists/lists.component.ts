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
import {ListsSelectionPopupComponent} from '../lists-selection-popup/lists-selection-popup.component';
import {WorkshopDeleteConfirmationPopupComponent} from '../workshop-delete-confirmation-popup/workshop-delete-confirmation-popup.component';
import {WorkshopNamePopupComponent} from '../workshop-name-popup/workshop-name-popup.component';
import {UserService} from '../../../core/database/user.service';
import {AppUser} from '../../../model/list/app-user';
import {CustomLinkPopupComponent} from '../../custom-links/custom-link-popup/custom-link-popup.component';
import {CustomLink} from '../../../core/database/custom-links/costum-link';
import {ListTemplateService} from '../../../core/database/list-template/list-template.service';
import {ExternalListImportPopupComponent} from '../external-list-import-popup/external-list-import-popup.component';

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

    userData: AppUser;

    constructor(private auth: AngularFireAuth, private alarmService: AlarmService,
                private dialog: MatDialog, private listManager: ListManagerService,
                private listService: ListService, private title: Title, private cd: ChangeDetectorRef,
                private workshopService: WorkshopService, private snack: MatSnackBar,
                private translator: TranslateService, private userService: UserService,
                private templateService: ListTemplateService) {
        super();
        this.subscriptions.push(userService.getUserData().subscribe(userData => this.userData = userData))
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

    public openLinkPopup(workshop: Workshop): void {
        const link = new CustomLink();
        link.redirectTo = `workshop/${workshop.$key}`;
        this.dialog.open(CustomLinkPopupComponent, {data: link});
    }

    updateWorkshop(workshop: Workshop): Observable<void> {
        return this.workshopService.update(workshop.$key, workshop);
    }

    changeWorkshopName(workshop: Workshop): void {
        this.dialog.open(WorkshopNamePopupComponent, {data: workshop.name})
            .afterClosed()
            .filter(name => name !== undefined && name.length > 0)
            .mergeMap(name => {
                workshop.name = name;
                return this.updateWorkshop(workshop);
            })
            .subscribe(() => {
                this.reloader$.next(null);
            });
    }

    removeListFromWorkshop(workshop: Workshop, listKey: string): void {
        workshop.listIds = workshop.listIds.filter(key => key !== listKey);
        this.updateWorkshop(workshop).subscribe(() => {
            // Force reload just in case.
            this.reloader$.next(null);
        });
    }

    addListsToWorkhop(workshop: Workshop, availableLists: List[]): void {
        this.dialog.open(ListsSelectionPopupComponent, {data: {workshop: workshop, lists: availableLists}})
            .afterClosed()
            .map(selections => selections.map(s => s.value))
            .mergeMap(resultListIds => {
                if (resultListIds !== undefined && resultListIds.length > 0) {
                    workshop.listIds = [...workshop.listIds, ...resultListIds];
                    return this.updateWorkshop(workshop);
                }
                return Observable.of(null);
            })
            .subscribe(() => {
                // Force reload just in case.
                this.reloader$.next(null)
            });
    }

    newWorkshop(): void {
        this.dialog.open(WorkshopNamePopupComponent).afterClosed().filter(name => name !== undefined && name.length > 0)
            .mergeMap(name => {
                const workshop = new Workshop();
                workshop.name = name;
                workshop.authorId = this.user.uid;
                return this.workshopService.add(workshop);
            })
            .subscribe(() => {
                this.reloader$.next(null);
            });
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
        this.lists.first().map(display => {
            let res = display.basicLists;
            Object.keys(display.rows).map(key => display.rows[key]).forEach(row => {
                res = [...res, ...row];
            });
            return res;
        }).subscribe(lists => {
            this.dialog.open(BulkRegeneratePopupComponent, {data: lists, disableClose: true});
        });
    }

    deleteWorkshop(workshop: Workshop): void {
        this.dialog.open(WorkshopDeleteConfirmationPopupComponent).afterClosed()
        // Checking just in case we get something not boolean which would evaluate to true.
            .filter(result => result === true)
            .switchMap(() => this.workshopService.remove(workshop.$key))
            .subscribe(() => {
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
        this.lists.first()
            .map(display => {
                let res = display.basicLists;
                Object.keys(display.rows).map(key => display.rows[key]).forEach(row => {
                    res = [...res, ...row];
                });
                return res;
            }).subscribe(lists => {
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

    openExternalListImportPopup(): void {
        this.dialog.open(ExternalListImportPopupComponent, {
            data:
                {
                    listName: this.newListFormControl.value,
                    userId: this.userData.$key
                },
            disableClose: true
        });
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

    trackByWorkshopFn(index: number, workshop: Workshop) {
        return workshop.$key;
    }

    ngOnInit() {
        this.workshops = this.auth.authState.mergeMap(user => {
            if (user === null) {
                return this.reloader$.mergeMap(() => Observable.of([]));
            } else {
                return this.reloader$.mergeMap(() => this.workshopService.getUserWorkshops(user.uid));
            }
        });
        this.lists =
            this.auth.authState.mergeMap(user => {
                    this.user = user;
                    if (user === null) {
                        return this.reloader$.mergeMap(() => Observable.of({basicLists: []}));
                    } else {
                        return this.reloader$.mergeMap(() =>
                            this.workshops.mergeMap(workshops => {
                                return Observable.combineLatest(this.listService.getUserLists(user.uid),
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
                                    }).map(lists => {
                                    return this.workshopService.getListsByWorkshop(lists, workshops);
                                });
                            }));
                    }
                }
            ).do(() => this.loading = false);
    }

}
