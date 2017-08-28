import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {ListManagerService} from '../core/list-manager.service';
import {List} from '../model/list';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {MdDialog, MdSnackBar} from '@angular/material';
import {ListNamePopupComponent} from '../list-name-popup/list-name-popup.component';
import {DataService} from '../core/data.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

    recipes: any[] = [];

    @ViewChild('filter')
    filter: ElementRef;

    lists: FirebaseListObservable<List[]>;

    constructor(private af: AngularFireDatabase, private auth: AngularFireAuth,
                private resolver: ListManagerService, private xivdb: DataService,
                private snackBar: MdSnackBar, private dialog: MdDialog) {
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

    addRecipe(recipe: any, recipeId, list: List, key: string): void {
        this.resolver.addToList(recipe.id, list, recipe.recipeId)
            .subscribe(updatedList => {
                this.lists.update(key, updatedList).then(() => {
                    this.snackBar.open(`${recipe.name} added to list ${list.name}`, '', {duration: 1000});
                });
            }, err => console.error(err));
    }

    addToNewList(recipe: any, recipeId: number): void {
        this.dialog.open(ListNamePopupComponent).afterClosed().subscribe(res => {
            const list = new List();
            list.name = res;
            this.lists.push(list).then(l => {
                this.addRecipe(recipe, list, recipeId, l.key);
            });
        });
    }

}
