import { Component, OnInit } from '@angular/core';
import { List } from '../../../../modules/list/model/list';
import { ListRow } from '../../../../modules/list/model/list-row';
import { ListsFacade } from '../../../../modules/list/+state/lists.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-relationships',
  templateUrl: './relationships.component.html',
  styleUrls: ['./relationships.component.less']
})
export class RelationshipsComponent implements OnInit {

  public item: ListRow;

  public list$: Observable<List>;

  public requires$: Observable<ListRow[]>;

  public requiredBy$: Observable<ListRow[]>;

  constructor(private listsFacade: ListsFacade) {
    this.list$ = this.listsFacade.selectedList$;
  }

  ngOnInit() {
    this.requires$ = this.list$.pipe(
      map(list => {
        return this.item.requires
          .sort((a, b) => a.id < b.id ? -1 : 1)
          .map(req => {
            const item = list.getItemById(req.id, true);
            return { ...item, reqAmount: req.amount, canBeCrafted: list.canBeCrafted(item) };
          });
      })
    );

    this.requiredBy$ = this.list$.pipe(
      map(list => {
        const requiredBy = [];
        list.forEach(item => {
          if (item.requires !== undefined) {
            item.requires.forEach(req => {
              if (req.id === this.item.id) {
                requiredBy.push({ ...item, canBeCrafted: list.canBeCrafted(item) });
              }
            });
          }
        });
        return requiredBy;
      })
    );
  }

}
