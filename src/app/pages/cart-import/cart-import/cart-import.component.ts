import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {List} from '../../../model/list/list';
import {MatDialog} from '@angular/material/dialog';
import {ListNamePopupComponent} from '../../../modules/common-components/list-name-popup/list-name-popup.component';
import {Observable} from 'rxjs/Observable';
import {ListService} from '../../../core/database/list.service';

@Component({
    selector: 'app-cart-import',
    templateUrl: './cart-import.component.html',
    styleUrls: ['./cart-import.component.scss']
})
export class CartImportComponent {

    progress = 0;

    constructor(route: ActivatedRoute, listManager: ListManagerService,
                dialog: MatDialog, listService: ListService, router: Router) {
        const list = new List();
        dialog.open(ListNamePopupComponent).afterClosed().subscribe(name => {
            let done = 0;
            list.name = name;
            route.params.subscribe(params => {
                const rawImportString = params.importString;
                const decoded = atob(rawImportString);
                const cart = decoded.split(';');
                const importObservables = [];
                // We create the list
                listService.push(list).then((id) => {
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
                            listService.update(id, list).then(() => {
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
        });
    }

}
