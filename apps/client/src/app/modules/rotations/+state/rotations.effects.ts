import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  DeleteRotation,
  GetRotation,
  MyRotationsLoaded,
  RotationLoaded,
  RotationPersisted,
  RotationsActionTypes,
  UpdateRotation
} from './rotations.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { CraftingRotationService } from '../../../core/database/crafting-rotation.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { of } from 'rxjs';

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
  getRotation$ = this.actions$.pipe(
    ofType<GetRotation>(RotationsActionTypes.GetRotation),
    switchMap(action => {
      return this.rotationsService.get(action.key).pipe(
        catchError(() => of({$key: action.key, notFound: true}))
      );
    }),
    map(rotation => new RotationLoaded(rotation))
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
    filter(res => res !== null),
    switchMap((res: string) => of(new RotationPersisted(res)))
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
