import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {List} from '../../../model/list/list';
import {MatDialog} from '@angular/material/dialog';
import {ListNamePopupComponent} from '../../../modules/common-components/list-name-popup/list-name-popup.component';
import {Observable} from 'rxjs';
import {ListService} from '../../../core/database/list.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {UserService} from '../../../core/database/user.service';

@Component({
    selector: 'app-list-import',
    templateUrl: './list-import.component.html',
    styleUrls: ['./list-import.component.scss']
})
export class CartImportComponent extends ComponentWithSubscriptions {

    progress = 0;

    constructor(route: ActivatedRoute, listManager: ListManagerService, userService: UserService,
                dialog: MatDialog, listService: ListService, router: Router) {
        super();
        const list = new List();
        this.subscriptions.push(
            userService.getUserData().map(u => {
                list.authorId = u.$key;
            }).switchMap(() => {
                return dialog.open(ListNamePopupComponent).afterClosed();
            }).filter(name => name !== undefined && name.length > 0).subscribe(name => {
                let done = 0;
                list.name = name;
                route.params.subscribe(params => {
                    const rawImportString = params.importString;
                    const decoded = atob(rawImportString);
                    const cart = decoded.split(';');
                    const importObservables = [];
                    // We create the list
                    listService.add(list).first().subscribe((id) => {
                        // Then we prepare the list creation Observable
                        cart.forEach(row => {
                            const parsed = row.split(',');
                            const itemId = +parsed[0];
                            const recipeId = parsed[1];
                            const quantity = +parsed[2];
                            importObservables.push(listManager.addToList(itemId, list, recipeId, quantity));
                        });
                        // We can now execute the observable
                        Observable.concat(...importObservables)
                            .subscribe(() => {
                                listService.update(id, list).first().subscribe(() => {
                                    done++;
                                    // Update progression
                                    this.progress = Math.ceil(100 * done / cart.length);
                                    // If everything is done, redirect to the list
                                    if (this.progress >= 100) {
                                        listService.getRouterPath(id).subscribe(path => {
                                            router.navigate(path);
                                        });
                                    }
                                });
                            });
                    });
                });
            }));
    }

}
