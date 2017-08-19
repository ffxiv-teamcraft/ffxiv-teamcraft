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

    recipes: Observable<any[]>;

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
        this.recipes = Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .mergeMap(() => {
                const filter = this.filter.nativeElement.value;
                if (filter === '') {
                    return Observable.of([]);
                }
                return this.xivdb.searchRecipe(filter)
                    .map(results => {
                        return results.recipes.results;
                    });
            });
    }

    addRecipe(recipe: any, list: List, key: string): void {
        this.xivdb.getRecipe(recipe.id).mergeMap(r => {
            return this.resolver.addToList(r.item.id, list, recipe.id);
        }).subscribe(updatedList => {
            this.lists.update(key, updatedList).then(() => {
                this.snackBar.open(`${recipe.name} added to list ${list.name}`, '', {duration: 1000});
            });
        });
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
