import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {ListManagerService} from '../../core/list/list-manager.service';
import {List} from '../../model/list/list';
import {MdDialog, MdSnackBar} from '@angular/material';
import {ListNamePopupComponent} from '../popup/list-name-popup/list-name-popup.component';
import {DataService} from '../../core/api/data.service';
import {Recipe} from '../../model/list/recipe';
import {I18nToolsService} from '../../core/i18n-tools.service';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {HtmlToolsService} from '../../core/html-tools.service';
import {ListService} from '../../core/firebase/list.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

    recipes: Recipe[] = [];

    @ViewChild('filter')
    filter: ElementRef;

    lists: Observable<List[]> = this.listService.getAll();

    loading = false;

    constructor(private resolver: ListManagerService, private db: DataService,
                private snackBar: MdSnackBar, private dialog: MdDialog,
                private i18n: I18nToolsService, private gt: GarlandToolsService,
                private translator: TranslateService, private router: Router,
                private htmlTools: HtmlToolsService, private listService: ListService) {
    }

    ngOnInit() {
        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(500)
            .distinctUntilChanged()
            .do(() => this.loading = true)
            .mergeMap(() => {
                const filter = this.filter.nativeElement.value;
                if (filter === '') {
                    return Observable.of([]);
                }
                return this.db.searchRecipe(filter);
            })
            .subscribe(results => {
                this.recipes = results;
                this.loading = false;
            });
    }

    getJob(id: number): any {
        return this.gt.getJob(id);
    }

    getStars(nb: number): string {
        return this.htmlTools.generateStars(nb);
    }

    addRecipe(recipe: Recipe, list: List, key: string, amount: number): void {
        this.resolver.addToList(recipe.itemId, list, recipe.recipeId, amount)
            .subscribe(updatedList => {
                this.listService.update(key, updatedList).then(() => {
                    this.snackBar.open(
                        `${this.i18n.getName(recipe.name)} added to list ${list.name}`,
                        this.translator.instant('Open'),
                        {
                            duration: 10000,
                            extraClasses: ['snack']
                        }
                    ).onAction().subscribe(() => {
                        this.listService.getRouterPath(key).subscribe(path => {
                            this.router.navigate(path);
                        });
                    });
                });
            }, err => console.error(err));
    }

    addToNewList(recipe: any, amount = 1): void {
        this.dialog.open(ListNamePopupComponent).afterClosed().subscribe(res => {
            const list = new List();
            list.name = res;
            this.listService.push(list).then(l => {
                this.addRecipe(recipe, list, l.key, amount);
            });
        });
    }

}
