import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';
import {BehaviorSubject, combineLatest, fromEvent, Observable} from 'rxjs';
import {ListTag} from '../../../model/list/list-tag.enum';
import {MatPaginator, PageEvent} from '@angular/material';
import {debounceTime, map, switchMap, tap} from 'rxjs/operators';

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
        this.lists = combineLatest(this.listService.getPublicLists(), this.tagFilter, this.nameFilter)
            .pipe(
                map(args => {
                    let lists = args[0];
                    const tagFilter = args[1];
                    const nameFilter = args[2];
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
                    return lists
                        .filter(list => list.recipes.length > 0)
                        .filter(list => list.tags !== undefined && list.tags.length > 0);
                }),
                tap(lists => {
                    this.publicListsLength = lists.length;
                    this.paginatorRef.pageIndex = 0;
                    this.paginator.next({pageIndex: 0, pageSize: this.paginatorRef.pageSize, length: this.publicListsLength});
                }),
                switchMap(lists => {
                    return this.paginator
                        .pipe(map(pagination => lists.slice(pagination.pageSize * pagination.pageIndex,
                            pagination.pageSize * pagination.pageIndex + pagination.pageSize)));
                })
            );
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

    closed(key: string): void {
        this.expanded = this.expanded.filter(i => i !== key);
    }

    opened(key: string): void {
        this.expanded.push(key);
    }

    ngOnInit(): void {
        fromEvent(this.nameFilterInput.nativeElement, 'keyup')
            .pipe(debounceTime(200))
            .subscribe(() => {
                this.nameFilter.next(this.nameFilterValue);
            })
    }
}
