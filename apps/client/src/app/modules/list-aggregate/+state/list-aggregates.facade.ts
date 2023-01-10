import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from './list-aggregates.reducer';
import { getAllListAggregates, getSelectedListAggregate } from './list-aggregates.selectors';
import {
  createListAggregate,
  deleteListAggregate,
  loadListAggregate,
  loadListAggregates, pureUpdateListAggregate,
  selectListAggregate,
  updateListAggregate
} from './list-aggregates.actions';
import { ListAggregate } from '../model/list-aggregate';
import { lazyLoaded } from '../../../core/rxjs/lazy-loaded';
import { of } from 'rxjs';
import { UpdateData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ListAggregatesFacade {

  allListAggregates$ = this.store.pipe(
    select(getAllListAggregates),
    lazyLoaded(this.store, of(loadListAggregates()))
  );

  selectedListAggregate$ = this.store.pipe(
    select(getSelectedListAggregate)
  );

  constructor(private store: Store<State>) {
  }

  loadAll(): void {
    this.store.dispatch(loadListAggregates());
  }

  loadAndSelect(id: string): void {
    this.store.dispatch(loadListAggregate({ id }));
    this.store.dispatch(selectListAggregate({ id }));
  }

  create(aggregate: ListAggregate): void {
    this.store.dispatch(createListAggregate({ aggregate }));
  }

  select(key: string): void {
    this.store.dispatch(selectListAggregate({ id: key }));
  }

  update(aggregate: ListAggregate): void {
    this.store.dispatch(updateListAggregate({ aggregate }));
  }

  pureUpdate($key: string, update: UpdateData<ListAggregate>): void {
    this.store.dispatch(pureUpdateListAggregate({ $key, update }));
  }

  delete(key: string) {
    this.store.dispatch(deleteListAggregate({ id: key }));
  }
}
