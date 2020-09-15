import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as CraftingReplayActions from './crafting-replay.actions';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { CraftingReplay } from '../model/crafting-replay';
import { CraftingReplayDbService } from '../../../core/database/crafting-replay-db.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable()
export class CraftingReplayEffects {
  static readonly LOCALSTORAGE_KEY = 'crafting-replays';
  static readonly MAX_LOG_SIZE = 100;

  loadCraftingReplays$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CraftingReplayActions.loadCraftingReplays),
      switchMap(() => {
        return this.authFacade.userId$.pipe(
          switchMap(userId => {
            return this.craftingReplayDbService.getByForeignKey(TeamcraftUser, userId);
          })
        );
      }),
      map(replays => {
        return CraftingReplayActions.loadCraftingReplaysSuccess({
          craftingReplays: [
            ...replays.map(onlineReplay => {
              onlineReplay.online = true;
              return onlineReplay;
            }),
            ...this.getLocalstore().map(offlineReplay => {
              offlineReplay.online = false;
              return offlineReplay;
            })
          ]
        });
      })
    )
  );

  loadCraftingReplay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CraftingReplayActions.loadCraftingReplay),
      switchMap(({ key }) => {
        return this.craftingReplayDbService.get(key);
      }),
      map(replay => {
        return CraftingReplayActions.craftingReplayLoaded({ craftingReplay: replay });
      })
    );
  });

  addCraftingReplay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CraftingReplayActions.addCraftingReplay),
      switchMap(action => {
        const localstore = this.getLocalstore();
        const newLength = localstore.unshift(action.craftingReplay);
        if (newLength > CraftingReplayEffects.MAX_LOG_SIZE) {
          localstore.pop();
        }
        return this.afs.httpsCallable('hashReplay')({ replay: action.craftingReplay }).pipe(
          tap(res => {
            action.craftingReplay.hash = res.hash;
            this.setLocalstore(localstore);
          })
        );
      })
    );
  }, { dispatch: false });

  persistCraftingReplay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CraftingReplayActions.persistCraftingReplay),
      switchMap(({ craftingReplay }) => {
        return this.afs.httpsCallable('saveReplay')({ replay: craftingReplay }).pipe(
          tap(() => {
            this.setLocalstore(this.getLocalstore().filter(replay => replay.$key !== craftingReplay.$key));
          })
        );
      })
    );
  }, { dispatch: false });

  deleteCraftingReplay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CraftingReplayActions.deleteCraftingReplay),
      map(({ key }) => {
        this.craftingReplayDbService.remove(key);
      })
    );
  }, { dispatch: false });

  constructor(private actions$: Actions, private authFacade: AuthFacade, private serializer: NgSerializerService,
              private craftingReplayDbService: CraftingReplayDbService, private afs: AngularFireFunctions) {
  }

  private getLocalstore(): CraftingReplay[] {
    return this.serializer.deserialize(JSON.parse(localStorage.getItem(CraftingReplayEffects.LOCALSTORAGE_KEY) || '[]'), [CraftingReplay]);
  }

  private setLocalstore(store: CraftingReplay[]): void {
    localStorage.setItem(CraftingReplayEffects.LOCALSTORAGE_KEY, this.serializer.serialize(store));
  }
}
