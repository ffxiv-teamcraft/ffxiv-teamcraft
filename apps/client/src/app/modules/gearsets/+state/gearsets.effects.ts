import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetService } from '../../../core/database/gearset.service';
import { DeleteGearset, GearsetsActionTypes, LoadGearset, LoadGearsets, UpdateGearset } from './gearsets.actions';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

@Injectable()
export class GearsetsEffects {

  @Effect()
  loadGearsets$ = this.actions$.pipe(
    ofType<LoadGearsets>(GearsetsActionTypes.LoadGearsets),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        distinctUntilChanged(),
        switchMap(userId => {
          return this.gearsetService.getByForeignKey(TeamcraftUser, userId);
        })
      );
    })
  );

  @Effect()
  loadGearset$ = this.actions$.pipe(
    ofType<LoadGearset>(GearsetsActionTypes.LoadGearset),
    switchMap(action => {
      return this.gearsetService.get(action.key);
    })
  );

  @Effect()
  updateGearset$ = this.actions$.pipe(
    ofType<UpdateGearset>(GearsetsActionTypes.UpdateGearset),
    switchMap(action => {
      return this.gearsetService.update(action.key, action.gearset);
    })
  );

  @Effect()
  deleteGearset$ = this.actions$.pipe(
    ofType<DeleteGearset>(GearsetsActionTypes.DeleteGearset),
    switchMap(action => {
      return this.gearsetService.remove(action.key);
    })
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private gearsetService: GearsetService) {
  }
}
