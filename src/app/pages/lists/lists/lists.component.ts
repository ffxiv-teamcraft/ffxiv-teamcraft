import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../../model/list/list';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {UserInfo} from 'firebase/app';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {ListService} from '../../../core/database/list.service';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {MathTools} from '../../../tools/math-tools';
import {Title} from '@angular/platform-browser';
import {AlarmService} from '../../../core/time/alarm.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {ListTag} from '../../../model/list/list-tag.enum';
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
import {CustomLink} from '../../../core/database/custom-links/custom-link';
import {ListTemplateService} from '../../../core/database/list-template/list-template.service';
import {ExternalListImportPopupComponent} from '../external-list-import-popup/external-list-import-popup.component';
import {PermissionsPopupComponent} from '../../../modules/common-components/permissions-popup/permissions-popup.component';
import {catchError, filter, first, map, mergeMap, switchMap} from 'rxjs/operators';
import {tap} from 'rxjs/internal/operators';
import {LinkToolsService} from '../../../core/tools/link-tools.service';

declare const ga: Function;

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss']
})
export class ListsComponent extends ComponentWithSubscriptions implements OnInit {

    reloader$ = new BehaviorSubject<void>(null);

    lists: Observable<{ basicLists: List[], publicLists?: List[], rows?: { [index: string]: List[] } }>;

    sharedLists: Observable<List[]>;

    tags: string[] = Object.keys(ListTag);

    tagFilter: BehaviorSubject<string[]> = new BehaviorSubject([]);

    user: UserInfo;

    newListFormControl = new FormControl('', Validators.required);

    @ViewChild('f') myNgForm;

    expanded: string[] = [];

    loading = true;

    workshops: Observable<Workshop[]>;

    sharedWorkshops: Observable<{ workshop: Workshop, lists: List[] }[]>;

    userData: AppUser;

    constructor(private auth: AngularFireAuth, private alarmService: AlarmService,
                private dialog: MatDialog, private listManager: ListManagerService,
                private listService: ListService, private title: Title, private cd: ChangeDetectorRef,
                private workshopService: WorkshopService, private snack: MatSnackBar,
                private translator: TranslateService, private userService: UserService,
                private templateService: ListTemplateService, private linkTools: LinkToolsService) {
        super();
        this.subscriptions.push(userService.getUserData().subscribe(userData => this.userData = userData))
    }

    createNewList(): void {
        if (this.newListFormControl.valid) {
            const list = new List();
            list.name = this.newListFormControl.value;
            list.authorId = this.user.uid;
            this.listService.add(list).pipe(first()).subscribe(() => {
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
            .pipe(
                filter(name => name !== undefined && name.length > 0),
                mergeMap(name => {
                    workshop.name = name;
                    return this.updateWorkshop(workshop);
                })
            )
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
            .pipe(
                map(selections => selections.map(s => s.value)),
                mergeMap(resultListIds => {
                    if (resultListIds !== undefined && resultListIds.length > 0) {
                        workshop.listIds = [...workshop.listIds, ...resultListIds];
                        return this.updateWorkshop(workshop);
                    }
                    return of(null);
                })
            )
            .subscribe(() => {
                // Force reload just in case.
                this.reloader$.next(null)
            });
    }

    newWorkshop(): void {
        this.dialog.open(WorkshopNamePopupComponent).afterClosed()
            .pipe(
                filter(name => name !== undefined && name.length > 0),
                mergeMap(name => {
                    const workshop = new Workshop();
                    workshop.name = name;
                    workshop.authorId = this.user.uid;
                    return this.workshopService.add(workshop);
                })
            )
            .subscribe(() => {
                this.reloader$.next(null);
            });
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('WORKSHOP.Share_link_copied'),
            '', {
                duration: 10000,
                panelClass: ['snack']
            });
    }

    getLink(workshop: Workshop): string {
        return this.linkTools.getLink(`/workshop/${workshop.$key}`);
    }

    regenerateAllLists(): void {
        this.lists.pipe(
            first(),
            map(display => {
                let res = display.basicLists;
                Object.keys(display.rows).map(key => display.rows[key]).forEach(row => {
                    res = [...res, ...row];
                });
                return res;
            })
        ).subscribe(lists => {
            this.dialog.open(BulkRegeneratePopupComponent, {data: lists, disableClose: true});
        });
    }

    deleteWorkshop(workshop: Workshop): void {
        this.dialog.open(WorkshopDeleteConfirmationPopupComponent).afterClosed().pipe(
            // Checking just in case we get something not boolean which would evaluate to true.
            filter(result => result === true),
            switchMap(() => this.workshopService.remove(workshop.$key))
        ).subscribe(() => {
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
        this.lists.pipe(
            first(),
            map(display => {
                let res = display.basicLists.concat(display.publicLists);
                Object.keys(display.rows).map(key => display.rows[key]).forEach(row => {
                    res = [...res, ...row];
                });
                return res;
            })
        ).subscribe(lists => {
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

    openPermissions(workshop: Workshop): void {
        this.dialog.open(PermissionsPopupComponent, {data: workshop})
            .afterClosed()
            .pipe(
                filter(res => res !== ''),
                mergeMap(result => this.workshopService.set(result.$key, result))
            )
            .subscribe();
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

    trackByWorkshopFn(index: number, workshop: Workshop) {
        return workshop.$key;
    }

    ngOnInit() {
        this.sharedLists = this.userService.getUserData().pipe(
            mergeMap(user => {
                return combineLatest((user.sharedLists || []).map(listId => this.listService.get(listId)
                        .pipe(
                            catchError(() => {
                                user.sharedLists = user.sharedLists.filter(id => id !== listId);
                                return this.userService.set(user.$key, user).pipe(map(() => null));
                            })
                        )
                    )
                )
                    .pipe(
                        map(lists => lists.filter(l => l !== null).filter(l => {
                            return l.getPermissions(user.$key).write === true
                        }))
                    );
            })
        );
        this.workshops = this.userService.getUserData().pipe(
            mergeMap(user => {
                if (user === null) {
                    return this.reloader$.pipe(mergeMap(() => of([])));
                } else {
                    return this.reloader$.pipe(mergeMap(() => this.workshopService.getUserWorkshops(user.$key)));
                }
            })
        );
        this.sharedWorkshops = this.userService.getUserData().pipe(
            mergeMap(user => {
                if (user === null) {
                    return this.reloader$.pipe(mergeMap(() => of([])));
                } else {
                    return this.reloader$.pipe(
                        mergeMap(() => {
                            return combineLatest((user.sharedWorkshops || []).map(workshopId => {
                                return this.workshopService.get(workshopId)
                                    .pipe(
                                        catchError(() => {
                                            user.sharedWorkshops = user.sharedWorkshops.filter(id => id !== workshopId);
                                            return this.userService.set(user.$key, user).pipe(map(() => null));
                                        }),
                                        mergeMap(workshop => {
                                            if (workshop !== null) {
                                                return this.listService.fetchWorkshop(workshop).pipe(map(lists => {
                                                    return {workshop: workshop, lists: lists};
                                                }));
                                            }
                                            return of(null);
                                        })
                                    );
                            })).pipe(
                                map(workshops => workshops.filter(w => w !== null && w !== undefined)
                                    .filter(row => row.workshop.getPermissions(user.$key).write === true))
                            );
                        })
                    );
                }
            }));
        this.lists =
            this.auth.authState
                .pipe(
                    mergeMap(user => {
                            this.user = user;
                            if (user === null) {
                                return this.reloader$.pipe(mergeMap(() => of({basicLists: []})));
                            } else {
                                return this.reloader$.pipe(
                                    mergeMap(() =>
                                        this.workshops.pipe(
                                            mergeMap(workshops => {
                                                return combineLatest(this.listService.getUserLists(user.uid),
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
                                                    })
                                                    .pipe(
                                                        mergeMap(lists => {
                                                            const additionalLists = [];
                                                            for (const workshop of workshops) {
                                                                for (const wsListId of workshop.listIds) {
                                                                    // If this list is not one of the user's lists, it won't be loaded
                                                                    if (lists.find(list => list.$key === wsListId) === undefined) {
                                                                        additionalLists.push(wsListId);
                                                                    }
                                                                }
                                                            }
                                                            if (additionalLists.length > 0) {
                                                                return combineLatest(additionalLists
                                                                    .map(listId => this.listService.get(listId)
                                                                        .pipe(
                                                                            catchError(() => of(null))
                                                                        )
                                                                    )
                                                                ).pipe(
                                                                    map(ls => ls.filter(l => l !== null)),
                                                                    map(externalLists => lists.concat(externalLists))
                                                                );
                                                            } else {
                                                                return of(lists);
                                                            }
                                                        }),
                                                        map(lists => {
                                                            const layout = this.workshopService.getListsByWorkshop(lists, workshops);
                                                            const publicLists = [];
                                                            const basicLists = [];
                                                            layout.basicLists.forEach(list => {
                                                                if (list.public) {
                                                                    publicLists.push(list);
                                                                } else {
                                                                    basicLists.push(list);
                                                                }
                                                            });
                                                            layout.basicLists = basicLists;
                                                            layout.publicLists = publicLists;
                                                            return layout;
                                                        })
                                                    );
                                            }))
                                    )
                                );
                            }
                        }
                    ),
                    tap(() => this.loading = false)
                );
    }

}
