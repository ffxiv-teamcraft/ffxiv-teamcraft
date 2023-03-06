import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getAllFishTrains, getAllPublicFishingTrains, getBoardedTrain, getLoaded, getSelectedTrain } from './fish-train.selectors';
import {
  boardTrain,
  claimConductorRole,
  leaveTrain,
  loadAllTrains,
  loadFishTrain,
  loadRunningTrains,
  pureUpdateTrain,
  selectFishTrain,
  setFishSlap
} from './fish-train.actions';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { DataType, FishTrainStop, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, of, timer } from 'rxjs';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';

@Injectable({
  providedIn: 'root'
})
export class FishTrainFacade {

  time$ = timer(0, 1000).pipe(
    map(() => Date.now()),
    shareReplay(1)
  );

  loaded$ = this.store.pipe(
    select(getLoaded)
  );

  selectedFishTrain$ = this.store.pipe(
    select(getSelectedTrain)
  );

  currentTrain$ = this.authFacade.userId$.pipe(
    switchMap(userId => {
      return this.store.pipe(
        select(getBoardedTrain(userId))
      );
    })
  );

  currentTrainWithLocations$ = this.currentTrain$.pipe(
    switchMap(train => {
      if (!train) {
        return of(null);
      }
      return this.lazyData.getRows('extracts', ...train.fish.map(stop => stop.id)).pipe(
        map(extracts => {
          return {
            ...train,
            fish: train.fish.map(stop => {
              return {
                ...stop,
                node: getItemSource(getExtract(extracts, stop.id), DataType.GATHERED_BY)?.nodes[0]
              };
            })
          };
        })
      );
    }),
    shareReplay(1)
  );

  currentTrainSpotId$ = combineLatest([this.time$, this.currentTrainWithLocations$]).pipe(
    map(([time, train]) => {
      if (!train) {
        return null;
      }
      return train.fish.find(stop => stop.end > time && stop.start <= time)?.node.id;
    }),
    distinctUntilChanged()
  );

  allTrains$ = this.store.pipe(
    select(getAllFishTrains)
  );

  allPublicTrains$ = this.store.pipe(
    select(getAllPublicFishingTrains)
  );

  constructor(private store: Store, private authFacade: AuthFacade,
              private lazyData: LazyDataFacade) {
  }

  load(id: string): void {
    this.store.dispatch(loadFishTrain({ id }));
  }

  loadRunning(): void {
    this.store.dispatch(loadRunningTrains());
  }

  loadAll(): void {
    this.store.dispatch(loadAllTrains());
  }

  select(id: string): void {
    this.store.dispatch(selectFishTrain({ id }));
  }

  boardTrain(id: string): void {
    this.store.dispatch(boardTrain({ id }));
  }

  claimConductorRole(id: string): void {
    this.store.dispatch(claimConductorRole({ id }));
  }

  rename(id: string, name: string): void {
    this.store.dispatch(pureUpdateTrain({ id, train: { name } }));
  }

  leaveTrain(id: string): void {
    this.store.dispatch(leaveTrain({ id }));
  }

  setSlap(train: PersistedFishTrain, fish: FishTrainStop, slap: number): void {
    this.store.dispatch(setFishSlap({ train, fish, slap }));
  }

  setPublicFlag(id: string, flag: boolean): void {
    this.store.dispatch(pureUpdateTrain({ id, train: { public: flag } }));
  }

  setTrainWorld(id: string, world: string): void {
    this.store.dispatch(pureUpdateTrain({ id, train: { world } }));
  }
}
