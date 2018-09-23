import { Component, OnInit } from '@angular/core';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { List } from '../../../modules/list/model/list';
import { ListRow } from '../../../modules/list/model/list-row';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.component.html',
  styleUrls: ['./list-details.component.less']
})
export class ListDetailsComponent implements OnInit {

  public display$: Observable<LayoutRowDisplay[]>;

  public finalItemsRow$: Observable<LayoutRowDisplay>;

  public list$: Observable<List>;

  public crystals$: Observable<ListRow[]>;

  constructor(private layoutsFacade: LayoutsFacade, private listsFacade: ListsFacade,
              private activatedRoute: ActivatedRoute) {
    this.list$ = this.listsFacade.selectedList$.pipe(shareReplay(1));
    this.finalItemsRow$ = this.list$.pipe(
      mergeMap(list => this.layoutsFacade.getFinalItemsDisplay(list))
    );
    this.display$ = this.list$.pipe(
      mergeMap(list => this.layoutsFacade.getDisplay(list))
    );
    this.crystals$ = this.list$.pipe(
      map(list => list.crystals)
    );
  }

  ngOnInit() {
    this.layoutsFacade.loadAll();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('listId')),
        tap((listId: string) => this.listsFacade.load(listId))
      )
      .subscribe(listId => {
        this.listsFacade.select(listId);
      });
  }

  trackByDisplayRow(index: number, row: LayoutRowDisplay): string {
    return row.filterChain + row.title;
  }

}
