import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CustomLinksPartialState } from './custom-links.reducer';
import { LoadMyCustomLinks } from './custom-links.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { customLinksQuery } from './custom-links.selectors';

@Injectable()
export class CustomLinksFacade {
  loaded$ = this.store.pipe(select(customLinksQuery.getLoaded));
  allCustomLinks$ = this.store.pipe(
    select(customLinksQuery.getAllCustomLinks)
  );
  selectedCustomLink$ = this.store.pipe(
    select(customLinksQuery.getSelectedCustomLink),
    filter(rotation => rotation !== undefined)
  );
  myCustomLinks$ = combineLatest(this.allCustomLinks$, this.authFacade.userId$).pipe(
    map(([folders, userId]) => folders.filter(folder => folder.authorId === userId)),
    shareReplay(1)
  );

  constructor(private store: Store<CustomLinksPartialState>,
              private authFacade: AuthFacade) {
  }

  loadMyCustomLinks() {
    this.store.dispatch(new LoadMyCustomLinks());
  }
}
