import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthActionTypes, Authenticated, LoggedInAsAnonymous, LoginAsAnonymous, UserFetched } from '../actions/auth.actions';
import { map, mergeMap } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { from } from 'rxjs';
import { AuthState } from '../reducers/auth.reducer';
import { UserService } from '../core/database/user.service';

@Injectable()
export class AuthEffects {

  @Effect()
  getUser$ = this.actions$.pipe(
    ofType(AuthActionTypes.GetUser),
    mergeMap(() => this.af.authState),
    map(authState => {
      if (authState === null) {
        return new LoginAsAnonymous();
      } else {
        const payload: Partial<AuthState> = {
          uid: authState.uid
        };
        if (authState.isAnonymous) {
          return new LoggedInAsAnonymous(authState.uid);
        }
        return new Authenticated(payload);
      }
    })
  );

  @Effect()
  loginAsAnonymous$ = this.actions$.pipe(
    ofType(AuthActionTypes.LoginAsAnonymous, AuthActionTypes.Logout),
    mergeMap(() => from(this.af.auth.signInAnonymously())),
    map(result => new LoggedInAsAnonymous(result.uid))
  );

  @Effect()
  fetchUserOnAuthenticated$ = this.actions$.pipe(
    ofType(AuthActionTypes.Authenticated),
    mergeMap((action: Authenticated) => this.userService.get(action.payload.uid)),
    map(user => new UserFetched(user))
  );

  constructor(private actions$: Actions, private af: AngularFireAuth, private userService: UserService) {
  }
}
