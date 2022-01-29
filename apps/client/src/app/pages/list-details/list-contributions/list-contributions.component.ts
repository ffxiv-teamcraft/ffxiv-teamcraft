import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { ListController } from '../../../modules/list/list-controller';

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

  // TODO
  public contributions$ = of({});

  constructor(private listsFacade: ListsFacade, private lazyData: LazyDataFacade) {
  }

  public sort(event: { key: string, value: string }): void {
    this.sort$.next(event);
  }

}
