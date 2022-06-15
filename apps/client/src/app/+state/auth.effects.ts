import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthState } from './auth.reducer';
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, filter, map, mergeMap, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';
import { EMPTY, from, of } from 'rxjs';
import { UserService } from '../core/database/user.service';
import {
  AddCharacter,
  ApplyContentId,
  AuthActionTypes,
  Authenticated,
  CommissionProfileLoaded,
  LinkingCharacter,
  LoggedInAsAnonymous,
  LoginAsAnonymous,
  LogTrackingLoaded,
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
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthFacade } from './auth.facade';
import { PatreonService } from '../core/patreon/patreon.service';
import { diff } from 'deep-diff';
import { LogTrackingService } from '../core/database/log-tracking.service';
import { debounceBufferTime } from '../core/rxjs/debounce-buffer-time';
import { CommissionProfile } from '../model/user/commission-profile';
import { CommissionProfileService } from '../core/database/commission-profile.service';
import { SettingsService } from '../modules/settings/settings.service';

@Injectable()
export class AuthEffects {


  getUser$ = createEffect(() => this.actions$.pipe(
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
  ));


  loginAsAnonymous$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActionTypes.LoginAsAnonymous, AuthActionTypes.Logout),
    mergeMap(() => from(this.af.signInAnonymously())),
    map((result: UserCredential) => new LoggedInAsAnonymous(result.user.uid))
  ));


  fetchUser$ = createEffect(() => this.actions$.pipe(
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
  ));


  watchNoLinkedCharacter$ = createEffect(() => this.actions$.pipe(
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
  ));


  openLinkPopupOnNoLinkedCharacter$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActionTypes.NoLinkedCharacter),
    withLatestFrom(this.authFacade.linkingCharacter$),
    filter(([, linking]) => !linking),
    tap(() => {
      this.authFacade.addCharacter(true, true);
    }),
    map(() => new LinkingCharacter())
  ));


  setAsDefaultCharacter$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActionTypes.AddCharacter),
    filter((action: AddCharacter) => action.setAsDefault),
    map((action: AddCharacter) => new SetDefaultCharacter(action.lodestoneId))
  ));


  saveUserOnEdition$ = createEffect(() => this.actions$.pipe(
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
      AuthActionTypes.SetWorld,
      AuthActionTypes.SetContentId
    ),
    debounceTime(100),
    withLatestFrom(this.authFacade.user$),
    map(([, user]) => new UpdateUser(user))
  ));


  selectContentId$ = createEffect(() => this.actions$.pipe(
    ofType<ApplyContentId>(AuthActionTypes.ApplyContentId),
    filter(() => this.settings.followIngameCharacterSwitches),
    withLatestFrom(this.authFacade.user$),
    map(([action, user]) => {
      const newDefault = user.lodestoneIds.find(entry => entry.contentId === action.contentId);
      if (newDefault) {
        user.defaultLodestoneId = newDefault.id;
      }
      return new UpdateUser(user);
    })
  ));


  updateUser$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateUser>(AuthActionTypes.UpdateUser),
    debounceTime(2000),
    switchMap((action) => {
      return this.userService.set(action.user.$key, action.user);
    }),
    map(() => new UserPersisted())
  ));


  registerUser$ = createEffect(() => this.actions$.pipe(
    ofType<RegisterUser>(AuthActionTypes.RegisterUser),
    switchMap((action) => {
      return this.userService.set(action.uid, action.user);
    }),
    map(() => new UserPersisted())
  ));


  fetchAlarmsOnUserAuth$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActionTypes.Authenticated, AuthActionTypes.LoggedInAsAnonymous),
    map(() => new LoadAlarms())
  ));


  markAsDoneInLog$ = createEffect(() => this.actions$.pipe(
    ofType<MarkAsDoneInLog>(AuthActionTypes.MarkAsDoneInLog),
    debounceBufferTime(1000),
    withLatestFrom(this.authFacade.user$),
    filter(([, user]) => user.defaultLodestoneId !== undefined),
    withLatestFrom(this.authFacade.serverLogTracking$),
    switchMap(([[actions, user], logTracking]) => {
      const entries = actions.filter(action => {
        return !action.done || !logTracking[action.log].includes(action.itemId);
      }).map(action => {
        return {
          itemId: action.itemId,
          log: action.log,
          done: action.done
        };
      });
      if (entries.length > 0) {
        return this.logTrackingService.markAsDone(`${user.$key}:${user.defaultLodestoneId.toString()}`, entries);
      }
      return EMPTY;
    })
  ), { dispatch: false });


  fetchCommissionProfile$ = createEffect(() => this.actions$.pipe(
    ofType<LoggedInAsAnonymous | Authenticated>(AuthActionTypes.LoggedInAsAnonymous, AuthActionTypes.Authenticated),
    switchMap(({ uid }) => {
      return this.commissionProfileService.get(uid)
        .pipe(
          catchError(() => {
            return this.commissionProfileService.set(uid, new CommissionProfile()).pipe(
              switchMapTo(EMPTY)
            );
          })
        );
    }),
    map(cProfile => new CommissionProfileLoaded(cProfile))
  ));

  fetchLogTracking$ = createEffect(() =>
    this.actions$.pipe(
      ofType<UserFetched>(AuthActionTypes.UserFetched),
      distinctUntilChanged((a, b) => a.user.defaultLodestoneId === b.user.defaultLodestoneId),
      switchMap(action => {
        return this.logTrackingService.get(`${action.user.$key}:${action.user.defaultLodestoneId?.toString()}`).pipe(
          catchError((_) => {
            return of({
              crafting: [],
              gathering: []
            });
          })
        );
      }),
      map(logTracking => new LogTrackingLoaded(logTracking))
    ));

  private nickNameWarningShown = false;


  showNicknameWarning$ = createEffect(() => this.actions$.pipe(
    ofType<UserFetched>(AuthActionTypes.UserFetched),
    debounceTime(10000),
    tap((action: UserFetched) => {
      const user = action.user;
      if (!this.nickNameWarningShown && user !== null && (user.patron || user.admin) && user.nickname === undefined) {
        this.notificationService.warning(this.translate.instant('COMMON.Warning'), this.translate.instant('SETTINGS.No_nickname_warning'));
        this.nickNameWarningShown = true;
      }
    }),
    switchMapTo(EMPTY)
  ), { dispatch: false });

  constructor(private actions$: Actions, private af: AngularFireAuth, private userService: UserService,
              private store: Store<{ auth: AuthState }>, private dialog: NzModalService,
              private translate: TranslateService, private xivapi: XivapiService,
              private notificationService: NzNotificationService, private authFacade: AuthFacade,
              private patreonService: PatreonService, private logTrackingService: LogTrackingService,
              private commissionProfileService: CommissionProfileService, private settings: SettingsService) {
  }
}
