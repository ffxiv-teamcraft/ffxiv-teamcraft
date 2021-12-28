import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CreateLayout, DeleteLayout, LayoutsActionTypes, LayoutsLoaded, SelectLayout, UpdateLayout } from './layouts.actions';
import { LayoutService } from '../layout.service';
import { distinctUntilChanged, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AuthFacade } from '../../../+state/auth.facade';
import { LayoutsFacade } from './layouts.facade';
import { EMPTY } from 'rxjs';

@Injectable()
export class LayoutsEffects {

  @Effect()
  loadLayouts$ = this.actions$.pipe(
    ofType(LayoutsActionTypes.LoadLayouts),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.layoutService.getByForeignKey(TeamcraftUser, userId);
    }),
    // We do not allow empty layouts array, if it's empty, return default layout on index 0;
    map(layouts => [
      this.layoutService.defaultLayout,
      this.layoutService.defaultLayoutNoVendor,
      this.layoutService.venilisCraftsTimedFirst,
      ...layouts
    ]),
    map(layouts => new LayoutsLoaded(layouts))
  );

  @Effect()
  createLayoutInDatabaseAndSelect$ = this.actions$.pipe(
    ofType(LayoutsActionTypes.CreateLayout),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]: [CreateLayout, string]) => {
      action.layout.userId = userId;
      return this.layoutService.add(action.layout);
    }),
    map((createdLayoutKey) => new SelectLayout(createdLayoutKey))
  );

  @Effect()
  updateLayoutInDatabase$ = this.actions$.pipe(
    ofType<UpdateLayout>(LayoutsActionTypes.UpdateLayout),
    filter(action => action.layout.$key !== undefined),
    switchMap((action: UpdateLayout) => {
      return this.layoutService.set(action.layout.$key, action.layout);
    }),
    mergeMap(() => EMPTY)
  );

  @Effect()
  removeLayoutInDatabase = this.actions$.pipe(
    ofType(LayoutsActionTypes.DeleteLayout),
    switchMap((action: DeleteLayout) => {
      return this.layoutService.remove(action.key);
    }),
    withLatestFrom(this.layoutsFacade.allLayouts$),
    map(([, layouts]) => {
      return new SelectLayout(layouts[0].$key);
    })
  );

  constructor(
    private actions$: Actions,
    private layoutService: LayoutService,
    private layoutsFacade: LayoutsFacade,
    private authFacade: AuthFacade
  ) {
  }
}
