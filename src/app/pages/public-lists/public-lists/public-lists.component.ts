import {Component} from '@angular/core';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-public-lists',
    templateUrl: './public-lists.component.html',
    styleUrls: ['./public-lists.component.scss']
})
export class PublicListsComponent {

    public lists: Observable<List[]> = this.listService.getPublicLists();

    expanded: string[] = [];

    constructor(private listService: ListService) {
    }
    
    closed(key: string): void {
        this.expanded = this.expanded.filter(i => i !== key);
    }

    opened(key: string): void {
        this.expanded.push(key);
    }

}
