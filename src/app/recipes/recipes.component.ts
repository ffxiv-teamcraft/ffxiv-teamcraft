import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ListManagerService } from '../core/list-manager.service';
import { List } from '../model/list';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { MdDialog, MdSnackBar } from '@angular/material';
import { ListNamePopupComponent } from '../list-name-popup/list-name-popup.component';
import { DataService } from '../core/data.service';
import { Recipe } from '../model/recipe';
import { I18nTools } from '../core/i18n-tools';
import { I18nName } from '../model/i18n-name';
import { GarlandToolsService } from '../core/garland-tools.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

    recipes: Recipe[] = [];

    @ViewChild('filter')
    filter: ElementRef;

    lists: FirebaseListObservable<List[]>;

    constructor(private af: AngularFireDatabase, private auth: AngularFireAuth,
                private resolver: ListManagerService, private xivdb: DataService,
                private snackBar: MdSnackBar, private dialog: MdDialog,
                private i18n: I18nTools, private gt: GarlandToolsService) {
    }

    ngOnInit() {
        this.auth.idToken.subscribe(user => {
            this.lists = this.af.list(`/lists/${user.uid}`);
        });
        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(500)
            .distinctUntilChanged()
            .mergeMap(() => {
                const filter = this.filter.nativeElement.value;
                if (filter === '') {
                    return Observable.of([]);
                }
                return this.xivdb.searchRecipe(filter);
            }).subscribe(results => this.recipes = results);
    }

    getJob(id: number): any {
        return this.gt.getJob(id);
    }

    getStars(nb: number): string {
        return this.resolver.generateStars(nb);
    }

    getName(i18nName: I18nName): string {
        return this.i18n.getName(i18nName);
    }

    addRecipe(recipe: Recipe, list: List, key: string): void {
        this.resolver.addToList(recipe.itemId, list, recipe.recipeId)
            .subscribe(updatedList => {
                this.lists.update(key, updatedList).then(() => {
                    this.snackBar.open(`${this.i18n.getName(recipe.name)} added to list ${list.name}`, '', {duration: 1000});
                });
            }, err => console.error(err));
    }

    addToNewList(recipe: any): void {
        this.dialog.open(ListNamePopupComponent).afterClosed().subscribe(res => {
            const list = new List();
            list.name = res;
            this.lists.push(list).then(l => {
                this.addRecipe(recipe, list, l.key);
            });
        });
    }

}
