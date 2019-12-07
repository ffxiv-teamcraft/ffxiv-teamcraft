import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { InventoryActionTypes, InventoryLoaded, ResetInventory, UpdateInventory } from './inventory.actions';
import { UserInventoryService } from '../../../core/database/user-inventory.service';
import { auditTime, distinctUntilKeyChanged, map, switchMap, switchMapTo, withLatestFrom } from 'rxjs/operators';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { AuthFacade } from '../../../+state/auth.facade';
import { SettingsService } from '../../settings/settings.service';
import { of } from 'rxjs';
import { INVENTORY_FEATURE_KEY } from './inventory.reducer';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PlatformService } from '../../../core/tools/platform.service';

@Injectable()
export class InventoryEffects {

  @Effect()
  loadInventory$ = this.actions$.pipe(
    ofType(InventoryActionTypes.LoadInventory),
    switchMapTo(this.authFacade.user$),
    distinctUntilKeyChanged('$key'),
    switchMap((user) => {
      const fromLocalStorage = localStorage.getItem(INVENTORY_FEATURE_KEY);
      if (fromLocalStorage === null) {
        const newInventory = new UserInventory();
        newInventory.characterId = user.defaultLodestoneId;
        return of(newInventory);
      }
      const fromLS = this.serializer.deserialize<UserInventory>(JSON.parse(fromLocalStorage), UserInventory);
      if (fromLS.$key === undefined) {
        fromLS.$key = user.$key;
      }
      return of(fromLS);
    }),
    map(inventory => new InventoryLoaded(inventory))
  );

  @Effect({ dispatch: false })
  updateInventory$ = this.actions$.pipe(
    ofType<UpdateInventory>(InventoryActionTypes.UpdateInventory),
    auditTime(30000),
    map(action => {
      localStorage.setItem(INVENTORY_FEATURE_KEY, JSON.stringify(action.payload));
    })
  );

  @Effect()
  resetInventory$ = this.actions$.pipe(
    ofType<ResetInventory>(InventoryActionTypes.ResetInventory),
    withLatestFrom(this.authFacade.user$),
    map(([, user]) => {
      const newInventory = new UserInventory();
      newInventory.characterId = user.defaultLodestoneId;
      newInventory.$key = user.$key;
      return new UpdateInventory(newInventory, true);
    })
  );

  constructor(
    private actions$: Actions,
    private inventoryService: UserInventoryService,
    private authFacade: AuthFacade,
    private settings: SettingsService,
    private serializer: NgSerializerService,
    private platform: PlatformService
  ) {
  }
}
