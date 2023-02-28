import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, map, mergeMap } from 'rxjs/operators';
import { loadFishTrain, loadFishTrainNotFound, loadFishTrainSuccess } from './fish-train.actions';
import { FishTrainService } from '../../../core/database/fish-train.service';
import { of } from 'rxjs';

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

  constructor(private actions$: Actions, private fishTrainService: FishTrainService) {
  }
}
