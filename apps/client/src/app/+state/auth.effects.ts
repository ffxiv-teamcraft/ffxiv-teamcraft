import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { AuthState } from './auth.reducer';
import { catchError, debounceTime, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, from, of } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
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
import { CharacterLinkPopupComponent } from '../core/auth/character-link-popup/character-link-popup.component';
import { XivapiService } from '@xivapi/angular-client';

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
    map(result => new LoggedInAsAnonymous(result.user.uid))
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
    tap(() => this.dialog.create({
      nzTitle: this.translate.instant('Character_informations'),
      nzContent: CharacterLinkPopupComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: false
    })),
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
      const missingCharacters = state.auth.user.lodestoneIds.filter(lodestoneId => state.auth.characters.find(char => char.Character.ID === lodestoneId) === undefined);
      const getMissingCharacters$ = missingCharacters.map(lodestoneId => this.xivapi.getCharacter(lodestoneId));
      return combineLatest(...getMissingCharacters$)
        .pipe(
          map(characters => new CharactersLoaded(characters))
        );
    })
  );

  @Effect()
  saveUserOnEdition$ = this.actions$.pipe(
    ofType(AuthActionTypes.AddCharacter, AuthActionTypes.SetDefaultCharacter),
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

  constructor(private actions$: Actions, private af: AngularFireAuth, private userService: UserService,
              private store: Store<{ auth: AuthState }>, private dialog: NzModalService,
              private translate: TranslateService, private xivapi: XivapiService,
              private notificationService: NzNotificationService) {
  }
}
