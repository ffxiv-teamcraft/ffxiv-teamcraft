import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ListTag} from '../../../model/list/list-tag.enum';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MatPaginator, PageEvent} from '@angular/material';

@Component({
    selector: 'app-public-lists',
    templateUrl: './public-lists.component.html',
    styleUrls: ['./public-lists.component.scss']
})
export class PublicListsComponent implements OnInit {

    @ViewChild('nameFilter')
    nameFilterInput: ElementRef;

    nameFilterValue = '';

    lists: Observable<List[]>;

    expanded: string[] = [];

    tagFilter: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    nameFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');

    tags: string[] = Object.keys(ListTag);

    publicListsLength = 0;

    pageSize = 25;

    paginator: BehaviorSubject<PageEvent> = new BehaviorSubject<PageEvent>({pageIndex: 0, pageSize: 25, length: 0});

    @ViewChild('paginatorRef')
    paginatorRef: MatPaginator;

    constructor(private listService: ListService) {
        this.lists = Observable.combineLatest(this.listService.getPublicLists(), this.tagFilter, this.nameFilter,
            (lists, tagFilter, nameFilter) => {
                if (nameFilter !== '') {
                    lists = lists.filter(list => list.name.toLowerCase().indexOf(nameFilter.toLowerCase()) > -1);
                }
                if (tagFilter.length > 0) {
                    lists = lists.filter(list => {
                        let match = true;
                        tagFilter.forEach(tag => {
                            match = match && list.tags.indexOf(ListTag[tag]) > -1;
                        });
                        return match;
                    });
                }
                lists = lists.filter(list => list.recipes.length > 0);
                return lists;
            })
            .do(lists => {
                this.publicListsLength = lists.length;
                this.paginatorRef.pageIndex = 0;
                this.paginator.next({pageIndex: 0, pageSize: this.paginatorRef.pageSize, length: this.publicListsLength});
            })
            .switchMap(lists => {
                return this.paginator
                    .map(pagination => lists.slice(pagination.pageSize * pagination.pageIndex,
                        pagination.pageSize * pagination.pageIndex + pagination.pageSize))
            });
    }

    closed(key: string): void {
        this.expanded = this.expanded.filter(i => i !== key);
    }

    opened(key: string): void {
        this.expanded.push(key);
    }

    ngOnInit(): void {
        Observable.fromEvent(this.nameFilterInput.nativeElement, 'keyup')
            .debounceTime(200)
            .subscribe(() => {
                this.nameFilter.next(this.nameFilterValue);
            })
    }
}
