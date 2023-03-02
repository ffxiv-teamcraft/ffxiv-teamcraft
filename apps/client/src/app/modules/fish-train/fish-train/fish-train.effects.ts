import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  boardTrain,
  leaveTrain,
  loadAllTrains,
  loadFishTrain,
  loadFishTrainNotFound,
  loadFishTrainsSuccess,
  loadFishTrainSuccess,
  loadRunningTrains
} from './fish-train.actions';
import { FishTrainService } from '../../../core/database/fish-train.service';
import { of } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { arrayRemove, arrayUnion, where } from '@angular/fire/firestore';
import { FishTrainFacade } from './fish-train.facade';

@Injectable()
export class FishTrainEffects {

  loadFishTrains$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadFishTrain),
      mergeMap(({ id }) => this.fishTrainService.get(id).pipe(
        map((train) => loadFishTrainSuccess({ train })),
        catchError((err) => {
          console.log(err);
          return of(loadFishTrainNotFound({ id }));
        })
      ))
    );
  });

  boardTrain$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(boardTrain),
      withLatestFrom(this.authFacade.userId$),
      mergeMap(([{ id }, userId]) => this.fishTrainService.pureUpdate(id, { passengers: arrayUnion(userId) }))
    );
  }, { dispatch: false });

  leaveTrain$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leaveTrain),
      withLatestFrom(this.authFacade.userId$),
      mergeMap(([{ id }, userId]) => this.fishTrainService.pureUpdate(id, { passengers: arrayRemove(userId) }))
    );
  }, { dispatch: false });

  loadRunningTrains$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadRunningTrains),
      withLatestFrom(this.facade.loaded$),
      filter(([, loaded]) => !loaded),
      switchMap(() => {
        const now = Date.now();
        return this.fishTrainService.query(where('end', '>', now)).pipe(
          map(trains => trains.filter(train => train.start <= now)),
          map((trains) => loadFishTrainsSuccess({ trains }))
        );
      })
    );
  });

  loadAllTrains$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadAllTrains),
      switchMap(() => {
        return this.fishTrainService.query().pipe(
          map((trains) => loadFishTrainsSuccess({ trains, loaded: true }))
        );
      })
    );
  });

  constructor(private actions$: Actions, private fishTrainService: FishTrainService,
              private authFacade: AuthFacade, private facade: FishTrainFacade) {
  }
}
