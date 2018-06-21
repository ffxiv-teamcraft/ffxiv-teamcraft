import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {combineLatest, fromEvent, Observable, of} from 'rxjs';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {List} from '../../../model/list/list';
import {MatCheckboxChange, MatDialog, MatSnackBar} from '@angular/material';
import {ListNamePopupComponent} from '../../../modules/common-components/list-name-popup/list-name-popup.component';
import {DataService} from '../../../core/api/data.service';
import {Recipe} from '../../../model/list/recipe';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {HtmlToolsService} from '../../../core/tools/html-tools.service';
import {ListService} from '../../../core/database/list.service';
import {SearchFilter} from '../../../model/search/search-filter.interface';
import {BulkAdditionPopupComponent} from '../bulk-addition-popup/bulk-addition-popup.component';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {UserService} from '../../../core/database/user.service';
import {PageComponent} from '../../../core/component/page-component';
import {ComponentType} from '@angular/cdk/portal';
import {RecipesHelpComponent} from '../recipes-help/recipes-help.component';
import {HelpService} from '../../../core/component/help.service';
import {ObservableMedia} from '@angular/flex-layout';
import {WorkshopService} from 'app/core/database/workshop.service';
import {Workshop} from '../../../model/other/workshop';
import {CraftingRotationService} from 'app/core/database/crafting-rotation.service';
import {CraftingRotation} from '../../../model/other/crafting-rotation';
import {debounceTime, distinctUntilChanged, filter, first, map, mergeMap, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {SearchResult} from '../../../model/list/search-result';
import {SettingsService} from '../../settings/settings.service';

declare const ga: Function;

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent extends PageComponent implements OnInit {

    results: SearchResult[] = [];

    selectedItems: SearchResult[] = [];

    @ViewChild('filter')
    filterElement: ElementRef;

    filters: SearchFilter[] = [
        {
            enabled: false,
            minMax: true,
            select: false,
            multiple: false,
            value: {
                min: 0,
                max: 999
            },
            name: 'filters/ilvl',
            filterName: 'ilvl'
        },
        {
            enabled: false,
            minMax: true,
            select: false,
            multiple: false,
            value: {
                min: 0,
                max: 70
            },
            name: 'filters/lvl',
            filterName: 'elvl'
        },
        {
            enabled: false,
            minMax: true,
            select: false,
            multiple: false,
            value: {
                min: 0,
                max: 70
            },
            name: 'filters/craft_lvl',
            filterName: 'clvl'
        },
        {
            enabled: false,
            minMax: false,
            select: false,
            multiple: true,
            value: [],
            values: this.gt.getJobs().filter(job => job.isJob !== undefined || job.category === 'Disciple of the Land'),
            name: 'filters/worn_by',
            filterName: 'jobCategories'
        },
        {
            enabled: false,
            minMax: false,
            select: true,
            multiple: false,
            value: 0,
            values: this.gt.getJobs().filter(job => job.category.indexOf('Hand') > -1),
            name: 'filters/crafted_by',
            filterName: 'craftJob'
        },
    ];

    query: string;

    lists: { basicLists: List[], rows: { [index: string]: List[] } } = {basicLists: [], rows: {}};

    sharedLists: Observable<List[]>;

    workshops: Observable<Workshop[]>;

    loading = false;

    rotations$: Observable<CraftingRotation[]>;

    constructor(private resolver: ListManagerService, private db: DataService,
                private snackBar: MatSnackBar, protected dialog: MatDialog,
                private i18n: I18nToolsService, private gt: GarlandToolsService,
                private translator: TranslateService, private router: Router,
                private htmlTools: HtmlToolsService, private listService: ListService,
                private localizedData: LocalizedDataService, private userService: UserService,
                protected helpService: HelpService, protected media: ObservableMedia,
                private workshopService: WorkshopService, private rotationsService: CraftingRotationService,
                public settings: SettingsService) {
        super(dialog, helpService, media);
    }

    ngOnInit() {
        super.ngOnInit();

        this.rotations$ = this.userService.getUserData()
            .pipe(
                mergeMap(user => {
                    return this.rotationsService.getUserRotations(user.$key);
                }),
                publishReplay(1),
                refCount()
            );

        this.sharedLists = this.userService.getUserData()
            .pipe(
                mergeMap(user => {
                    return combineLatest((user.sharedLists || []).map(listId => this.listService.get(listId)))
                        .pipe(
                            map(lists => lists.filter(l => l !== null).filter(l => l.getPermissions(user.$key).write === true))
                        );
                })
            );

        this.workshops = this.userService.getUserData()
            .pipe(
                mergeMap(user => {
                    if (user.$key !== undefined) {
                        return this.workshopService.getUserWorkshops(user.$key);
                    } else {
                        return of([]);
                    }
                })
            );
        // Load user's lists
        this.subscriptions.push(this.userService.getUserData()
            .pipe(
                mergeMap((user) => {
                    if (user.$key !== undefined) {
                        return this.listService.getUserLists(user.$key)
                            .pipe(
                                mergeMap(lists => {
                                    return this.workshopService.getUserWorkshops(user.$key)
                                        .pipe(
                                            map(workshops => this.workshopService.getListsByWorkshop(lists, workshops))
                                        );
                                })
                            );
                    }
                    return of({basicLists: [], rows: {}});
                })
            ).subscribe(lists => {
                this.lists = lists;
            }));

        // Connect debounce listener on recipe search field
        this.subscriptions.push(fromEvent(this.filterElement.nativeElement, 'keyup')
            .pipe(
                debounceTime(500),
                distinctUntilChanged()
            ).subscribe(() => {
                this.doSearch();
            })
        );
    }

    /**
     * Adds a jobCategory to current filters.
     * @param {number} id
     * @param {MatCheckboxChange} event
     */
    checkJobCategory(id: number, event: MatCheckboxChange): void {
        const jobCategories = this.filters.find(recipeFilter => recipeFilter.filterName === 'jobCategories');
        if (event.checked) {
            jobCategories.value.push(id);
        } else {
            jobCategories.value = jobCategories.value.filter(jobId => jobId !== id);
        }
    }

    /**
     * Fires a search request, including filters.
     */
    doSearch(): void {
        this.loading = true;
        let hasFilters = false;
        this.filters.forEach(f => hasFilters = hasFilters || f.enabled);
        if ((this.query === undefined || this.query === '') && !hasFilters) {
            this.results = [];
            this.loading = false;
            return;
        }
        this.subscriptions.push(this.db.searchItem(this.query, this.filters, this.settings.recipesOnlySearch).subscribe(results => {
            this.results = results;
            this.loading = false;
        }));
    }

    /**
     * Gets job informations from a given job id.
     * @param {number} id
     * @returns {any}
     */
    getJob(id: number): any {
        return this.gt.getJob(id);
    }

    /**
     * Generates star html string for recipes with stars.
     * @param {number} nb
     * @returns {string}
     */
    getStars(nb: number): string {
        return this.htmlTools.generateStars(nb);
    }

    resultChecked(item: SearchResult, checked: boolean): void {
        if (checked) {
            this.selectedItems.push(item);
        } else {
            this.selectedItems = this.selectedItems.filter(row => row !== item);
        }
    }

    addSelected(list: List, key: string): void {
        const additions = [];
        this.selectedItems
            .forEach(item => {
                additions.push(this.resolver.addToList(item.itemId, list, (<Recipe>item).recipeId, 1));
            });
        this.subscriptions.push(this.dialog.open(BulkAdditionPopupComponent, {
            data: {additions: additions, key: key, listname: list.name},
            disableClose: true
        }).afterClosed().subscribe(() => {
            this.selectedItems = [];
            this.snackBar.open(
                this.translator.instant('Recipes_Added', {listname: list.name}),
                this.translator.instant('Open'),
                {
                    duration: 10000,
                    panelClass: ['snack']
                }
            ).onAction().subscribe(() => {
                this.listService.getRouterPath(key).subscribe(path => {
                    this.router.navigate(path);
                });
            });
        }));
    }

    addSelectedToNewList(): void {
        this.createNewList().then(res => {
            this.addSelected(res.list, res.id);
        });
    }


    /**
     * Adds a recipe to a given list
     *
     * @param {Recipe} recipe The recipe we want to add
     * @param {List} list The list we want to add the recipe to
     * @param {string} key The database key of the list
     * @param {string} amount The amount of items we want to add, this is handled as a string because a string is expected from the template
     * @param collectible
     */
    addRecipe(recipe: Recipe, list: List, key: string, amount: string, collectible: boolean): void {
        this.subscriptions.push(this.resolver.addToList(recipe.itemId, list, recipe.recipeId, +amount, collectible)
            .subscribe(updatedList => {
                this.listService.set(key, updatedList).pipe(first()).subscribe(() => {
                    this.snackBar.open(
                        this.translator.instant('Recipe_Added',
                            {itemname: this.i18n.getName(this.localizedData.getItem(recipe.itemId)), listname: list.name}),
                        this.translator.instant('Open'),
                        {
                            duration: 10000,
                            panelClass: ['snack']
                        }
                    ).onAction().subscribe(() => {
                        this.listService.getRouterPath(key).subscribe(path => {
                            this.router.navigate(path);
                        });
                    });
                });
            }, err => console.error(err)));
    }

    quickList(recipe: Recipe, amount: string, collectible: boolean): void {
        const list = new List();
        ga('send', 'event', 'List', 'creation');
        list.name = this.i18n.getName(this.localizedData.getItem(recipe.itemId));
        list.ephemeral = true;
        this.subscriptions.push(this.resolver.addToList(recipe.itemId, list, recipe.recipeId, +amount, collectible)
            .pipe(
                switchMap((l) => {
                    return this.userService.getUserData()
                        .pipe(
                            map(u => {
                                l.authorId = u.$key;
                                return l;
                            })
                        );
                }),
                switchMap(quickList => {
                    return this.listService.add(quickList)
                        .pipe(
                            map(uid => {
                                list.$key = uid;
                                return list;
                            })
                        );
                })
            ).subscribe((l) => {
                this.listService.getRouterPath(l.$key).subscribe(path => {
                    this.router.navigate(path);
                });
            }));
    }

    /**
     * Adds the current resultSet to a given list.
     * @param {List} list
     * @param {string} key
     */
    addAllRecipes(list: List, key: string): void {
        const additions = [];
        this.results
            .forEach(item => {
                additions.push(this.resolver.addToList(item.itemId, list, (<Recipe>item).recipeId, 1));
            });
        this.subscriptions.push(this.dialog.open(BulkAdditionPopupComponent, {
            data: {additions: additions, key: key, listname: list.name},
            disableClose: true
        }).afterClosed().subscribe(() => {
            this.snackBar.open(
                this.translator.instant('Recipes_Added', {listname: list.name}),
                this.translator.instant('Open'),
                {
                    duration: 10000,
                    panelClass: ['snack']
                }
            ).onAction().subscribe(() => {
                this.listService.getRouterPath(key).subscribe(path => {
                    this.router.navigate(path);
                });
            });
        }));
    }

    /**
     * Adds the current result set to a new list.
     */
    addAllToNewList(): void {
        this.createNewList().then(res => {
            this.addAllRecipes(res.list, res.id);
        });
    }

    /**
     * Adds a given recipe to a new list.
     * @param recipe
     * @param {string} amount
     * @param collectible
     */
    addToNewList(recipe: any, amount: string, collectible: boolean): void {
        this.createNewList().then(res => {
            this.addRecipe(recipe, res.list, res.id, amount, collectible);
        });
    }

    /**
     * Creates a new list using the dialog to ask for a name.
     * @returns {Promise<string>}
     */
    createNewList(): Promise<{ id: string, list: List }> {
        return new Promise<{ id: string, list: List }>(resolve => {
            this.subscriptions.push(this.dialog.open(ListNamePopupComponent).afterClosed()
                .pipe(
                    filter(name => name !== undefined && name.length > 0),
                    switchMap(res => {
                        return this.userService.getUserData()
                            .pipe(
                                map(u => {
                                    return {authorId: u.$key, listName: res};
                                })
                            )
                    })
                ).subscribe(res => {
                    const list = new List();
                    ga('send', 'event', 'List', 'creation');
                    list.name = res.listName;
                    list.authorId = res.authorId;
                    this.listService.add(list).pipe(first()).subscribe(id => {
                        resolve({id: id, list: list});
                    });
                })
            )
            ;
        });
    }


    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return RecipesHelpComponent;
    }

}
