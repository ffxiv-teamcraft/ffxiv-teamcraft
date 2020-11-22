import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthState } from './auth.reducer';
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EMPTY, from, of } from 'rxjs';
import { UserService } from '../core/database/user.service';
import {
  AddCharacter,
  AuthActionTypes,
  Authenticated,
  LinkingCharacter,
  LoggedInAsAnonymous,
  LoginAsAnonymous,
  MarkAsDoneInLog,
  NoLinkedCharacter,
  RegisterUser,
  SetDefaultCharacter,
  UpdateUser,
  UserFetched,
  UserPersisted
} from './auth.actions';
import { Store } from '@ngrx/store';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';
import { XivapiService } from '@xivapi/angular-client';
import { LoadAlarms } from '../core/alarms/+state/alarms.actions';
import { User, UserCredential } from '@firebase/auth-types';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthFacade } from './auth.facade';
import { PatreonService } from '../core/patreon/patreon.service';
import { diff } from 'deep-diff';
import { LogTrackingService } from '../core/database/log-tracking.service';
import { debounceBufferTime } from '../core/rxjs/debounce-buffer-time';

@Injectable()
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
        return new Authenticated(payload, payload.uid, new Date(authState.metadata.creationTime));
      }
    })
  );

  @Effect()
  loginAsAnonymous$ = this.actions$.pipe(
    ofType(AuthActionTypes.LoginAsAnonymous, AuthActionTypes.Logout),
    mergeMap(() => from(this.af.signInAnonymously())),
    map((result: UserCredential) => new LoggedInAsAnonymous(result.user.uid))
  );

  @Effect()
  fetchUser$ = this.actions$.pipe(
    ofType<LoggedInAsAnonymous | Authenticated>(AuthActionTypes.LoggedInAsAnonymous, AuthActionTypes.Authenticated),
    exhaustMap((action: LoggedInAsAnonymous | Authenticated) => {
      return this.userService.get(action.uid, false, true).pipe(
        map(user => {
          return user;
        }),
        tap(user => {
          if (user.notFound) {
            this.store.dispatch(new RegisterUser(user.$key, new TeamcraftUser()));
          }
        })
      );
    }),
    map((user: TeamcraftUser) => {
      // If token has been refreshed more than 3 weeks ago, refresh it now.
      if (user.patron && Date.now() - user.lastPatreonRefresh >= 3 * 7 * 86400000) {
        this.patreonService.refreshToken(user);
      }
      if (user.defaultLodestoneId === undefined && user.lodestoneIds.length > 0) {
        user.defaultLodestoneId = user.lodestoneIds[0].id;
      }
      if (user.defaultLodestoneId && !user.lodestoneIds.some(entry => entry.id === user.defaultLodestoneId)) {
        user.defaultLodestoneId = user.lodestoneIds[0].id;
      }
      return user;
    }),
    catchError((error) => {
      if (error.message.toLowerCase().indexOf('not found') > -1) {
        return of(new TeamcraftUser());
      } else {
        this.authFacade.logout();
        console.error(error);
        this.notificationService.error(this.translate.instant('COMMON.Error'), this.translate.instant('Network_error_logged_out'));
        return EMPTY;
      }
    }),
    map(user => new UserFetched(user)),
    debounceTime(250)
  );

  private nickNameWarningShown = false;

  @Effect()
  showNicknameWarning$ = this.actions$.pipe(
    ofType<UserFetched>(AuthActionTypes.UserFetched),
    debounceTime(10000),
    tap((action: UserFetched) => {
      const user = action.user;
      if (!this.nickNameWarningShown && user !== null && (user.patron || user.admin) && user.nickname === undefined) {
        this.notificationService.warning(this.translate.instant('COMMON.Warning'), this.translate.instant('SETTINGS.No_nickname_warning'));
        this.nickNameWarningShown = true;
      }
    })
  );

  @Effect()
  watchNoLinkedCharacter$ = this.actions$.pipe(
    ofType<UserFetched>(AuthActionTypes.UserFetched),
    distinctUntilChanged((a, b) => {
      return a.user.notFound !== b.user.notFound
        && diff(a.user.lodestoneIds, b.user.lodestoneIds);
    }),
    withLatestFrom(this.authFacade.loggedIn$),
    filter(([action, loggedIn]) => {
      return loggedIn
        && action.user && !action.user.notFound
        && [...action.user.customCharacters, ...action.user.lodestoneIds].length === 0;
    }),
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
  saveUserOnEdition$ = this.actions$.pipe(
    ofType(
      AuthActionTypes.AddCharacter,
      AuthActionTypes.RemoveCharacter,
      AuthActionTypes.SetDefaultCharacter,
      AuthActionTypes.SetCurrentFcId,
      AuthActionTypes.ToggleFavorite,
      AuthActionTypes.ToggleMasterbooks,
      AuthActionTypes.SaveSet,
      AuthActionTypes.VerifyCharacter,
      AuthActionTypes.SaveDefaultConsumables,
      AuthActionTypes.SetCID,
      AuthActionTypes.SetWorld
    ),
    debounceTime(100),
    withLatestFrom(this.authFacade.user$),
    map(([, user]) => new UpdateUser(user))
  );

  @Effect()
  updateUser$ = this.actions$.pipe(
    ofType<UpdateUser>(AuthActionTypes.UpdateUser),
    debounceTime(2000),
    switchMap((action) => {
      return this.userService.set(action.user.$key, action.user);
    }),
    map(() => new UserPersisted())
  );

  @Effect()
  registerUser$ = this.actions$.pipe(
    ofType<RegisterUser>(AuthActionTypes.RegisterUser),
    switchMap((action) => {
      return this.userService.set(action.uid, action.user);
    }),
    map(() => new UserPersisted())
  );

  @Effect()
  fetchAlarmsOnUserAuth$ = this.actions$.pipe(
    ofType(AuthActionTypes.Authenticated, AuthActionTypes.LoggedInAsAnonymous),
    map(() => new LoadAlarms())
  );

  @Effect({ dispatch: false })
  markAsDoneInLog$ = this.actions$.pipe(
    ofType<MarkAsDoneInLog>(AuthActionTypes.MarkAsDoneInLog),
    debounceBufferTime(2000),
    withLatestFrom(this.authFacade.user$),
    filter(([, user]) => user.defaultLodestoneId !== undefined),
    switchMap(([actions, user]) => {
      return this.logTrackingService.markAsDone(`${user.$key}:${user.defaultLodestoneId.toString()}`, actions.map(action => {
        return {
          itemId: action.itemId,
          log: action.log,
          done: action.done
        };
      }));
    })
  );

  constructor(private actions$: Actions, private af: AngularFireAuth, private userService: UserService,
              private store: Store<{ auth: AuthState }>, private dialog: NzModalService,
              private translate: TranslateService, private xivapi: XivapiService,
              private notificationService: NzNotificationService, private authFacade: AuthFacade,
              private patreonService: PatreonService, private logTrackingService: LogTrackingService) {
  }
}
