import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ListsCountUpdated, ListsStoredCountUpdated, StatsActionTypes } from '../actions/stats.actions';
import { AngularFireDatabase } from 'angularfire2/database';
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class StatsEffects {

  @Effect()
  loadListsCount$ = this.actions$.pipe(
    ofType(StatsActionTypes.LoadStats),
    mergeMap(() => this.firebase.object<number>('lists_created').valueChanges()),
    map(value => new ListsCountUpdated(value))
  );

  @Effect()
  loadCommissionsCount$ = this.actions$.pipe(
    ofType(StatsActionTypes.LoadStats),
    mergeMap(() => this.firebase.object<number>('list_count').valueChanges()),
    map(value => new ListsStoredCountUpdated(value))
  );

  constructor(private actions$: Actions, private firebase: AngularFireDatabase) {
  }
}
