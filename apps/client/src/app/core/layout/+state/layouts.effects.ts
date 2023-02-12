import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  createListLayout,
  deleteListLayout,
  loadListLayout,
  loadListLayouts,
  loadListLayoutsSuccess,
  loadListLayoutSuccess,
  selectListLayout,
  updateListLayout
} from './layouts.actions';
import { LayoutService } from '../layout.service';
import { distinctUntilChanged, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AuthFacade } from '../../../+state/auth.facade';
import { LayoutsFacade } from './layouts.facade';
import { EMPTY } from 'rxjs';

@Injectable()
export class LayoutsEffects {


  loadLayouts$ = createEffect(() => this.actions$.pipe(
    ofType(loadListLayouts),
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
    map(layouts => loadListLayoutsSuccess({ layouts }))
  ));


  loadLayout$ = createEffect(() => this.actions$.pipe(
    ofType(loadListLayout),
    switchMap(({ key }) => {
      return this.layoutService.get(key);
    }),
    map(layout => loadListLayoutSuccess({ layout }))
  ));


  createLayoutInDatabaseAndSelect$ = createEffect(() => this.actions$.pipe(
    ofType(createListLayout),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.layout.userId = userId;
      return this.layoutService.add(action.layout);
    }),
    map((createdLayoutKey) => selectListLayout({ key: createdLayoutKey }))
  ));


  updateLayoutInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType(updateListLayout),
    filter(action => action.layout.$key !== undefined),
    switchMap((action) => {
      return this.layoutService.set(action.layout.$key, action.layout);
    }),
    mergeMap(() => EMPTY)
  ), { dispatch: false });


  removeLayoutInDatabase = createEffect(() => this.actions$.pipe(
    ofType(deleteListLayout),
    switchMap((action) => {
      return this.layoutService.remove(action.id);
    }),
    withLatestFrom(this.layoutsFacade.allLayouts$),
    map(([, layouts]) => {
      return selectListLayout({ key: layouts[0].$key });
    })
  ));

  constructor(
    private actions$: Actions,
    private layoutService: LayoutService,
    private layoutsFacade: LayoutsFacade,
    private authFacade: AuthFacade
  ) {
  }
}

