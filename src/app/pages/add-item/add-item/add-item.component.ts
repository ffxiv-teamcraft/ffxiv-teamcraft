import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ItemData} from '../../../model/garland-tools/item-data';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../../../core/api/data.service';
import {List} from '../../../model/list/list';
import {ListService} from '../../../core/database/list.service';
import {AngularFireAuth} from 'angularfire2/auth';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ListNamePopupComponent} from '../../../modules/common-components/list-name-popup/list-name-popup.component';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {TranslateService} from '@ngx-translate/core';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {LocalizedDataService} from '../../../core/data/localized-data.service';

@Component({
    selector: 'app-add-item',
    templateUrl: './add-item.component.html',
    styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

    public itemData: Observable<ItemData>;

    public recipeId: Observable<string>;

    public lists: Observable<List[]>;

    private userId: string;

    public selectedList: List;

    public quantity = 1;

    constructor(private route: ActivatedRoute, private dataService: DataService,
                private listService: ListService, private auth: AngularFireAuth,
                private dialog: MatDialog, private snack: MatSnackBar,
                private listManager: ListManagerService, private translator: TranslateService,
                private i18n: I18nToolsService, private localizedData: LocalizedDataService,
                private router: Router) {
    }

    addItem(): void {
        let list: Observable<List>;
        // If this is a new list;
        if (this.selectedList.name === undefined) {
            list = this.dialog.open(ListNamePopupComponent).afterClosed()
                .filter(name => name !== undefined && name.length > 0)
                .switchMap(name => {
                    this.selectedList.name = name;
                    return this.listService.add(this.selectedList).switchMap(listId => this.listService.get(listId));
                });
        } else {
            list = Observable.of(this.selectedList);
        }
        Observable.combineLatest(list, this.itemData, this.recipeId, (l, itemData, recipeId) => {
            return {list: l, itemData: itemData, recipeId: recipeId};
        }).first().switchMap(data => {
            return this.listManager.addToList(data.itemData.item.id, data.list, data.recipeId, this.quantity)
                .switchMap(resultList => this.listService.update(data.list.$key, resultList))
                .switchMap(() => {
                    return this.snack.open(
                        this.translator.instant('Recipe_Added',
                            {
                                itemname: this.i18n.getName(this.localizedData
                                    .getItem(data.itemData.item.id)), listname: data.list.name
                            }),
                        this.translator.instant('Open'),
                        {
                            duration: 10000,
                            extraClasses: ['snack']
                        })
                        .onAction()
                        .map(() => {
                            return data.list.$key;
                        });
                });
        }).subscribe((key) => {
            this.listService.getRouterPath(key).subscribe(path => {
                this.router.navigate(path);
            });
        });
    }

    newList(): List {
        const list = new List();
        list.authorId = this.userId;
        return list;
    }

    ngOnInit() {
        const parsedObservable = this.route.params.map(params => {
            const rawImportString = params.importString;
            const decoded = atob(rawImportString);
            return decoded.split(',');
        });

        this.itemData = parsedObservable.switchMap(parsed => {
            return this.dataService.getItem(+parsed[0]);
        });

        this.recipeId = parsedObservable.map(parsed => {
            return parsed[1];
        });

        this.lists = this.auth.authState
            .do(auth => this.userId = auth.uid)
            .switchMap(auth => {
                return this.listService.getUserLists(auth.uid);
            });
    }

}
