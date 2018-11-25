import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DeleteRotation, MyRotationsLoaded, RotationPersisted, RotationsActionTypes, UpdateRotation } from './rotations.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { CraftingRotationService } from '../../../core/database/crafting-rotation.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY, of } from 'rxjs';

@Injectable()
export class RotationsEffects {

  @Effect()
  loadMyRotations$ = this.actions$.pipe(
    ofType(RotationsActionTypes.LoadMyRotations),
    switchMap(() => this.authFacade.userId$),
    switchMap(userId => {
      return this.rotationsService.getByForeignKey(TeamcraftUser, userId).pipe(
        map(rotations => new MyRotationsLoaded(rotations, userId))
      );
    })
  );

  @Effect()
  updateRotation$ = this.actions$.pipe(
    ofType<UpdateRotation>(RotationsActionTypes.UpdateRotation),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      if (action.rotation.$key === undefined || action.rotation.getPermissionLevel(userId) < 30) {
        action.rotation.authorId = userId;
        return this.rotationsService.add(action.rotation).pipe();
      } else {
        return this.rotationsService.set(action.rotation.$key, action.rotation);
      }
    }),
    switchMap((res) => res !== null ? of(new RotationPersisted(res)) : EMPTY)
  );

  @Effect()
  deleteRotation$ = this.actions$.pipe(
    ofType<DeleteRotation>(RotationsActionTypes.DeleteRotation),
    switchMap((action) => {
      return this.rotationsService.remove(action.key);
    })
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private rotationsService: CraftingRotationService
  ) {
  }
}
