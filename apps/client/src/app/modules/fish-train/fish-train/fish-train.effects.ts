import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  boardTrain,
  claimConductorRole,
  leaveTrain,
  loadAllTrains,
  loadFishTrain,
  loadFishTrainNotFound,
  loadFishTrainsSuccess,
  loadFishTrainSuccess,
  loadRunningTrains,
  renameTrain,
  setFishSlap,
  setFishTrainPublic
} from './fish-train.actions';
import { FishTrainService } from '../../../core/database/fish-train.service';
import { combineLatest, of } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { arrayRemove, arrayUnion, deleteField, where } from '@angular/fire/firestore';
import { FishTrainFacade } from './fish-train.facade';
import { FishTrainStop } from '@ffxiv-teamcraft/types';

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

  claimConductorRole$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(claimConductorRole),
      withLatestFrom(this.authFacade.userId$),
      mergeMap(([{ id }, userId]) => this.fishTrainService.pureUpdate(id, { conductor: userId, conductorToken: deleteField() }))
    );
  }, { dispatch: false });

  leaveTrain$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(leaveTrain),
      withLatestFrom(this.authFacade.userId$),
      mergeMap(([{ id }, userId]) => this.fishTrainService.pureUpdate(id, { passengers: arrayRemove(userId) }))
    );
  }, { dispatch: false });

  renameTrain$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(renameTrain),
      mergeMap(({ id, name }) => this.fishTrainService.pureUpdate(id, { name: name }))
    );
  }, { dispatch: false });

  setFishTrainPublic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setFishTrainPublic),
      mergeMap(({ id, flag }) => this.fishTrainService.pureUpdate(id, { public: flag }))
    );
  }, { dispatch: false });

  setFishSlap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setFishSlap),
      mergeMap(({ train, fish, slap }) => {
        const stops: FishTrainStop[] = train.fish.map(fish => {
          return {
            id: fish.id,
            start: fish.start,
            end: fish.end,
            slap: fish.slap || null
          };
        });
        const matchingFish = stops.find(stop => stop.start === fish.start && stop.id === fish.id);
        matchingFish.slap = slap;
        return this.fishTrainService.pureUpdate(train.$key, { fish: stops });
      })
    );
  }, { dispatch: false });

  loadRunningTrains$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadRunningTrains),
      withLatestFrom(this.facade.loaded$),
      filter(([, loaded]) => !loaded),
      switchMap(() => {
        const now = Date.now();
        return this.fishTrainService.query(where('public', '==', true), where('end', '>', now)).pipe(
          map(trains => trains.filter(train => train.start <= now)),
          map((trains) => loadFishTrainsSuccess({ trains }))
        );
      })
    );
  });

  loadAllTrains$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadAllTrains),
      switchMap(() => this.authFacade.userId$),
      switchMap((userId) => {
        return combineLatest([
          this.fishTrainService.query(where('public', '==', true)),
          this.fishTrainService.query(where('conductor', '==', userId))
        ]).pipe(
          map(([publicTrains, myTrains]) => loadFishTrainsSuccess({ trains: [...publicTrains, ...myTrains], loaded: true }))
        );
      })
    );
  });

  constructor(private actions$: Actions, private fishTrainService: FishTrainService,
              private authFacade: AuthFacade, private facade: FishTrainFacade) {
  }
}
