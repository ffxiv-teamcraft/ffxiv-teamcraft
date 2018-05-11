import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ListService} from '../../../core/database/list.service';
import {Observable} from 'rxjs';
import {List} from '../../../model/list/list';
import {Inventory} from '../../../model/other/inventory';

@Component({
    selector: 'app-list-inventory',
    templateUrl: './list-inventory.component.html',
    styleUrls: ['./list-inventory.component.scss']
})
export class ListInventoryComponent implements OnInit {

    inventory: Observable<{ id: number, icon: number, amount: number }[][]>;

    listUid: string;

    constructor(private route: ActivatedRoute, private listService: ListService, private router: Router) {
    }

    ngOnInit(): void {
        this.inventory = this.route.params
            .do(params => this.listUid = params.listId)
            .switchMap(params => this.listService.get(params.listId))
            .map((list: List) => {
                const inventory = new Inventory();
                list.forEach(item => {
                    // If it's a crystal, we don't mind.
                    if (item.id < 20) {
                        return;
                    }
                    if (!inventory.isFull() && item.done - item.used > 0) {
                        inventory.add(item.id, item.icon, item.done - item.used);
                    }
                });
                return inventory;
            })
            .map(inventory => inventory.getDisplay())
            .distinctUntilChanged();
    }

    backToList(): void {
        this.router.navigate(['list', this.listUid]);
    }
}
