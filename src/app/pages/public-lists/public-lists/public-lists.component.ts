import {Component} from '@angular/core';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ListTag} from '../../../model/list/list-tag.enum';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'app-public-lists',
    templateUrl: './public-lists.component.html',
    styleUrls: ['./public-lists.component.scss']
})
export class PublicListsComponent {

    lists: Observable<List[]>;

    expanded: string[] = [];

    tagFilter: BehaviorSubject<string[]> = new BehaviorSubject<ListTag[]>([]);

    tags: string[] = Object.keys(ListTag);

    constructor(private listService: ListService) {
        this.lists = Observable.combineLatest(this.listService.getPublicLists(), this.tagFilter, (lists, tagFilter) => {
            if (tagFilter.length > 0) {
                lists = lists.filter(list => {
                    tagFilter.forEach(tag => {
                        return list.tags.indexOf(ListTag[tag]) > -1;
                    });
                });
            }
            return lists;
        });
    }

    closed(key: string): void {
        this.expanded = this.expanded.filter(i => i !== key);
    }

    opened(key: string): void {
        this.expanded.push(key);
    }

}
