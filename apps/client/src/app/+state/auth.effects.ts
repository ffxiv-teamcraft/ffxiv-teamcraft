import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { AuthState } from './auth.reducer';
import { catchError, debounceTime, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { UserService } from '../core/database/user.service';
import {
  AddCharacter,
  AnonymousWarningShown,
  AuthActionTypes,
  Authenticated,
  CharactersLoaded,
  LinkingCharacter,
  LoggedInAsAnonymous,
  LoginAsAnonymous,
  NoLinkedCharacter,
  SetDefaultCharacter,
  UserFetched,
  UserPersisted
} from './auth.actions';
import { Store } from '@ngrx/store';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { CharacterResponse, XivapiService } from '@xivapi/angular-client';
import { LoadAlarms } from '../core/alarms/+state/alarms.actions';
import { User } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthFacade } from './auth.facade';
import UserCredential = firebase.auth.UserCredential;

@Injectable({
  providedIn: 'root'
})
export class AuthEffects {

  @Effect()
  getUser$ = this.actions$.pipe(
    ofType(AuthActionTypes.GetUser),
    mergeMap(() => this.af.authState),
    map((authState: User) => {
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
    map((result: UserCredential) => new LoggedInAsAnonymous(result.user.uid))
  );

  @Effect()
  fetchUserOnAuthenticated$ = this.actions$.pipe(
    ofType(AuthActionTypes.Authenticated),
    mergeMap((action: Authenticated) => this.userService.get(action.payload.uid)),
    catchError(() => of(new TeamcraftUser())),
    map(user => new UserFetched(user))
  );

  @Effect()
  watchNoLinkedCharacter$ = this.actions$.pipe(
    // Avoid recursion
    filter(action => action.type !== AuthActionTypes.NoLinkedCharacter && action.type !== AuthActionTypes.LinkingCharacter),
    withLatestFrom(this.store),
    filter(([action, state]) => state.auth.loggedIn && state.auth.user !== null),
    filter(([action, state]) => state.auth.user.lodestoneIds.length === 0 && state.auth.user.defaultLodestoneId === undefined),
    map(() => new NoLinkedCharacter())
  );

  @Effect()
  openLinkPopupOnNoLinkedCharacter$ = this.actions$.pipe(
    ofType(AuthActionTypes.NoLinkedCharacter),
    withLatestFrom(this.authFacade.linkingCharacter$),
    filter(([, linking]) => !linking),
    tap(() => {
      this.authFacade.addCharacter(true, true);
    }),
    map(() => new LinkingCharacter())
  );

  @Effect()
  setAsDefaultCharacter$ = this.actions$.pipe(
    ofType(AuthActionTypes.AddCharacter),
    filter((action: AddCharacter) => action.setAsDefault),
    map((action: AddCharacter) => new SetDefaultCharacter(action.lodestoneId))
  );

  @Effect()
  updateCharactersList$ = this.actions$.pipe(
    ofType(AuthActionTypes.AddCharacter, AuthActionTypes.UserFetched),
    withLatestFrom(this.store),
    mergeMap(([, state]) => {
      const missingCharacters = state.auth.user.lodestoneIds.filter(lodestoneId => state.auth.characters.find(char => char.Character.ID === lodestoneId.id) === undefined);
      const getMissingCharacters$ = missingCharacters.map(lodestoneId => {
        const reloader = new BehaviorSubject<void>(null);
        return reloader.pipe(
          switchMap(() => {
            return this.xivapi.getCharacter(lodestoneId.id);
          }),
          tap(res => {
            if (res.Info.Character.State === 1) {
              setTimeout(() => {
                reloader.next(null);
              }, 120000);
            }
          }),
          map(res => {
            if (res.Info.Character.State === 1) {
              return {
                Character: {
                  Name: 'Parsing character...'
                }
              };
            }
            return res;
          })
        );
      });
      return combineLatest(...getMissingCharacters$)
        .pipe(
          map(characters => new CharactersLoaded(<CharacterResponse[]>characters))
        );
    })
  );

  @Effect()
  saveUserOnEdition$ = this.actions$.pipe(
    ofType(
      AuthActionTypes.AddCharacter,
      AuthActionTypes.RemoveCharacter,
      AuthActionTypes.SetDefaultCharacter,
      AuthActionTypes.SetCurrentFcId,
      AuthActionTypes.ToggleFavorite,
      AuthActionTypes.ToggleMasterbooks,
    ),
    withLatestFrom(this.store),
    mergeMap(([, state]) => {
      return this.userService.set(state.auth.uid, { ...state.auth.user });
    }),
    map(() => new UserPersisted())
  );

  @Effect()
  warningOnAnonymousAccount$ = this.actions$.pipe(
    ofType(AuthActionTypes.LoggedInAsAnonymous),
    debounceTime(10000),
    tap(() => this.notificationService.warning(
      this.translate.instant('COMMON.Warning'),
      this.translate.instant('Anonymous_Warning'))),
    map(() => new AnonymousWarningShown())
  );

  @Effect()
  fetchAlarmsOnUserAuth$ = this.actions$.pipe(
    ofType(AuthActionTypes.Authenticated, AuthActionTypes.LoggedInAsAnonymous),
    map(() => new LoadAlarms())
  );

  constructor(private actions$: Actions, private af: AngularFireAuth, private userService: UserService,
              private store: Store<{ auth: AuthState }>, private dialog: NzModalService,
              private translate: TranslateService, private xivapi: XivapiService,
              private notificationService: NzNotificationService, private authFacade: AuthFacade) {
  }
}
