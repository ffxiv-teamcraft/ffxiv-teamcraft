import { Injectable } from '@angular/core';

import { select, Store, Action } from '@ngrx/store';

import * as fromCommissions from './commissions.reducer';
import * as CommissionsSelectors from './commissions.selectors';

@Injectable()
export class CommissionsFacade {
  loaded$ = this.store.pipe(select(CommissionsSelectors.getCommissionsLoaded));
  allCommissions$ = this.store.pipe(
    select(CommissionsSelectors.getAllCommissions)
  );
  selectedCommissions$ = this.store.pipe(
    select(CommissionsSelectors.getSelected)
  );

  constructor(private store: Store<fromCommissions.CommissionsPartialState>) {}

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
