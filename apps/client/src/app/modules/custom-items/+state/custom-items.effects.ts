import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CustomItemsActionTypes } from './custom-items.actions';

@Injectable()
export class CustomItemsEffects {
  @Effect({ dispatch: false })
  loadCustomItems$ = this.actions$.pipe(
    ofType(CustomItemsActionTypes.LoadCustomItems)
    //TODO
  );

  constructor(
    private actions$: Actions
  ) {
  }
}
