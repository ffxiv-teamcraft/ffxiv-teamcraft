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
      const result = list.getContributionStats(list.modificationsHistory, this.lazyData);
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
