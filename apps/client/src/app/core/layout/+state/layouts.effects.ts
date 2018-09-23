import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { LayoutsActionTypes, LayoutsLoaded } from './layouts.actions';
import { LayoutService } from '../layout.service';
import { distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AuthFacade } from '../../../+state/auth.facade';

@Injectable()
export class LayoutsEffects {

  @Effect()
  loadLayouts$ = this.actions$.pipe(
    ofType(LayoutsActionTypes.LoadLayouts),
    mergeMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    mergeMap((userId) => {
      return this.layoutService.getByForeignKey(TeamcraftUser, userId);
    }),
    // We do not allow empty layouts array, if it's empty, return default layout on index 0;
    map(layouts => layouts.length ===0?[this.layoutService.defaultLayout]:layouts),
    map(layouts => new LayoutsLoaded(layouts))
  );

  constructor(
    private actions$: Actions,
    private layoutService: LayoutService,
    private authFacade: AuthFacade
  ) {
  }
}
