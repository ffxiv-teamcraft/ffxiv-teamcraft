import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-list-contributions',
  templateUrl: './list-contributions.component.html',
  styleUrls: ['./list-contributions.component.less']
})
export class ListContributionsComponent {

  private sort$ = new BehaviorSubject({
    key: 'amount',
    value: 'ascend'
  });

  public contributions$ = combineLatest([this.listsFacade.selectedList$, this.sort$]).pipe(
    map(([list, sort]) => {
      const result = list.modificationsHistory
        .filter(entry => entry.amount > 0)
        .reduce((stats, entry) => {
          let statsRow = stats.entries.find(s => s.userId === entry.userId);
          if (statsRow === undefined) {
            stats.entries.push({
              userId: entry.userId,
              amount: 0,
              ilvlAmount: 0
            });
            statsRow = stats.entries[stats.entries.length - 1];
          }
          statsRow.amount += entry.amount;
          stats.total += entry.amount;
          statsRow.ilvlAmount += entry.amount * this.lazyData.data.ilvls[entry.itemId];
          stats.ilvlTotal += entry.amount * this.lazyData.data.ilvls[entry.itemId];
          return stats;
        }, { entries: [], total: 0, ilvlTotal: 0 });
      result.entries.sort((a, b) => {
        return sort.value === 'ascend' ? a[sort.key] - b[sort.key] : b[sort.key] - a[sort.key];
      });
      return result;
    })
  );

  constructor(private listsFacade: ListsFacade, private lazyData: LazyDataService) {
  }

  public sort(event: { key: string, value: string }): void {
    this.sort$.next(event);
  }

}
