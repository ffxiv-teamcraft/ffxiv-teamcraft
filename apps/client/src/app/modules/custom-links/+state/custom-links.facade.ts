import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CustomLinksPartialState } from './custom-links.reducer';
import { CreateCustomLink, DeleteCustomLink, LoadMyCustomLinks, UpdateCustomLink } from './custom-links.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { customLinksQuery } from './custom-links.selectors';
import { CustomLink } from '../../../core/database/custom-links/custom-link';

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

  createCustomLink(link: CustomLink): void {
    this.store.dispatch(new CreateCustomLink(link));
  }

  updateCustomLink(link: CustomLink): void {
    this.store.dispatch(new UpdateCustomLink(link));
  }

  deleteCustomLink(key: string): void {
    this.store.dispatch(new DeleteCustomLink(key));
  }

  loadMyCustomLinks() {
    this.store.dispatch(new LoadMyCustomLinks());
  }
}
