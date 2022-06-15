import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import {
  ApplyContentId,
  GetUser,
  LinkingCharacter,
  Logout,
  MarkAsDoneInLog,
  RegisterUser,
  RemoveCharacter,
  SaveDefaultConsumables,
  SaveSet,
  SetCID,
  SetContentId,
  SetCurrentFcId,
  SetDefaultCharacter,
  SetWorld,
  ToggleFavorite,
  ToggleMasterbooks,
  UpdateUser,
  VerifyCharacter
} from './auth.actions';
import { UserCredential } from '@firebase/auth-types';
import { catchError, distinctUntilChanged, filter, first, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PlatformService } from '../core/tools/platform.service';
import { IpcService } from '../core/electron/ipc.service';
import { CharacterLinkPopupComponent } from '../core/auth/character-link-popup/character-link-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, from, Observable, of } from 'rxjs';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { DefaultConsumables } from '../model/user/default-consumables';
import { Favorites } from '../model/other/favorites';
import { OauthService } from '../core/auth/oauth.service';
import { ConvertLists } from '../modules/list/+state/lists.actions';
import { Character } from '@xivapi/angular-client';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { LogTracking } from '../model/user/log-tracking';
import { TeamcraftGearsetStats } from '../model/user/teamcraft-gearset-stats';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { LogTrackingService } from '../core/database/log-tracking.service';
import { LodestoneService } from '../core/api/lodestone.service';
import { isEqual } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {

  loaded$ = this.store.select(authQuery.getLoaded);

  linkingCharacter$ = this.store.select(authQuery.getLinkingCharacter);

  loggedIn$ = this.store.select(authQuery.getLoggedIn);

  userId$ = this.store.select(authQuery.getUserId).pipe(filter(uid => !!uid));

  user$ = this.store.select(authQuery.getUser).pipe(filter(u => !!u && !u.notFound && u.$key !== undefined));

  logTracking$ = this.store.select(authQuery.getLogTracking).pipe(filter(log => !!log));

  serverLogTracking$ = this.store.select(authQuery.getServerLogTracking).pipe(filter(log => !!log));

  favorites$ = this.user$.pipe(map(user => user.favorites));

  idToken$ = this.af.user.pipe(
    filter(user => user !== null),
    switchMap(user => {
      return from(user.getIdTokenResult())
        .pipe(
          map((token) => ([user, token]))
        );
    }),
    switchMap(([user, token]: [any, any]) => {
      if (token.claims['https://hasura.io/jwt/claims'] === undefined
        || token.claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] === undefined) {
        console.log('Token missing claims for hasura');
        return this.fns.httpsCallable('setCustomUserClaims')({
          uid: user.uid
        }).pipe(
          switchMap(() => {
            return from(user.getIdTokenResult(true));
          })
        );
      }
      return of(token);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  characters$ = this.user$.pipe(
    filter(u => u.lodestoneIds !== undefined),
    switchMap((user: TeamcraftUser) => {
      return combineLatest(user.lodestoneIds.map(entry => {
        if (entry.id > 0) {
          return this.characterService.getCharacter(entry.id, true)
            .pipe(
              catchError(() => of(null))
            );
        }
        return of({
          Character: user.customCharacters.find(c => c.ID === entry.id)
        });
      }));
    }),
    map(characters => characters.filter(c => c && c.Character)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  characterEntries$ = this.user$.pipe(
    filter(u => u.lodestoneIds !== undefined),
    switchMap((user: TeamcraftUser) => {
      return combineLatest(user.lodestoneIds.map(entry => {
        if (entry.id > 0) {
          return this.characterService.getCharacter(entry.id, true)
            .pipe(
              catchError(() => of(null)),
              map(c => {
                return {
                  ...entry,
                  character: c
                };
              })
            );
        }
        return of({
          ...entry,
          character: {
            Character: user.customCharacters.find(c => c.ID === entry.id)
          }
        });
      }));
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  mainCharacterEntry$ = combineLatest([
    this.user$.pipe(
      distinctUntilChanged((a, b) => {
        return a.defaultLodestoneId === b.defaultLodestoneId
          && isEqual(a.lodestoneIds, b.lodestoneIds);
      })
    ),
    this.characters$
  ]).pipe(
    map(([user, characters]) => {
      const character = characters
        .filter(c => c.Character)
        .find(char => char.Character.ID === user.defaultLodestoneId);
      const lodestoneIdEntry = (user.lodestoneIds || []).find(entry => entry.id === user.defaultLodestoneId);
      // If we couldn't find it, it's maybe because it's a custom one (for KR servers)
      if (character === undefined) {
        const custom = <Character>user.customCharacters.find(c => c.ID === user.defaultLodestoneId);
        return {
          ...lodestoneIdEntry,
          character: custom
        };
      }
      return {
        ...lodestoneIdEntry,
        character: character.Character
      };
    }),
    filter(c => c !== undefined)
  );

  mainCharacter$ = this.mainCharacterEntry$.pipe(
    map((entry) => {
      return entry.character as Character;
    }),
    filter(c => !!c)
  );

  fcId$ = combineLatest([this.mainCharacter$, this.user$]).pipe(
    filter((res) => !res.includes(undefined)),
    distinctUntilChanged(([a], [b]) => {
      return a.FreeCompanyId === b.FreeCompanyId;
    }),
    map(([character, user]) => {
      if (!character || !character.FreeCompanyId || !character.FreeCompanyId
        || character.FreeCompanyId.toString() === user.currentFcId) {
        return { id: user.currentFcId, save: false };
      }
      return { id: character.FreeCompanyId.toString(), save: true };
    }),
    tap(entry => {
      if (entry.save) {
        this.store.dispatch(new SetCurrentFcId(entry.id));
      }
    }),
    map(entry => entry.id),
    startWith('')
  );

  gearSets$ = this.loggedIn$.pipe(
    switchMap((loggedIn: boolean) => {
      if (loggedIn) {
        return this.mainCharacterEntry$;
      }
      return of(null);
    }),
    map((data) => {
      if (data === null) {
        data = { stats: [] } as any;
      }
      return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(jobId => {
        const set = (data.stats || []).find(stat => stat.jobId === jobId);
        const jobEntry = (data.character?.ClassJobs || [] as any).find(job => job.JobID === jobId);
        const level = jobEntry ? jobEntry.Level : 0;
        if (set === undefined) {
          return {
            jobId: jobId,
            level: level,
            cp: 0,
            control: 0,
            craftsmanship: 0,
            specialist: false
          };
        }
        return set;
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private store: Store<{ auth: AuthState }>, private af: AngularFireAuth,
              private platformService: PlatformService, private ipc: IpcService,
              private dialog: NzModalService, private translate: TranslateService,
              private oauthService: OauthService, private fns: AngularFireFunctions,
              private logTrackingService: LogTrackingService, private characterService: LodestoneService) {
    this.ipc.playerSetupPackets$.subscribe(packet => {
      this.setCID(packet.contentId.toString());
    });

    this.ipc.worldId$.pipe(
      distinctUntilChanged()
    ).subscribe((worldId) => {
        this.setWorld(worldId);
    });
  }

  public async getIdTokenResult(forceRefresh = false) {
    const user = await this.af.currentUser;
    return await user.getIdTokenResult(forceRefresh);
  }

  resetPassword(email: string): void {
    this.af.sendPasswordResetEmail(email);
  }

  changeEmail(newEmail: string): Observable<void> {
    return this.af.user.pipe(
      first(),
      switchMap(user => {
        return from(user.updateEmail(newEmail));
      })
    );
  }

  public addCharacter(useAsDefault = false, disableClose = false): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Character_informations'),
      nzContent: CharacterLinkPopupComponent,
      nzComponentParams: {
        useAsDefault: useAsDefault,
        mandatory: disableClose
      },
      nzFooter: null,
      nzMaskClosable: !disableClose,
      nzClosable: !disableClose
    });
    this.store.dispatch(new LinkingCharacter());
  }

  public setDefaultCharacter(lodestoneId: number): void {
    this.store.dispatch(new SetDefaultCharacter(lodestoneId));
  }

  public removeCharacter(lodestoneId: number): void {
    this.store.dispatch(new RemoveCharacter(lodestoneId));
  }

  public saveMasterbooks(books: { id: number, checked: boolean }[]): void {
    this.store.dispatch(new ToggleMasterbooks(books));
  }

  public saveSet(set: TeamcraftGearsetStats | GearSet, ignoreSpecialist = false): void {
    this.store.dispatch(new SaveSet(set as TeamcraftGearsetStats, ignoreSpecialist));
  }

  public saveDefaultConsumables(consumables: DefaultConsumables): void {
    this.store.dispatch(new SaveDefaultConsumables(consumables));
  }

  public loadUser(): void {
    this.store.dispatch(new GetUser());
  }

  public verifyCharacter(lodestoneId: number) {
    this.store.dispatch(new VerifyCharacter(lodestoneId));
  }

  public updateUser(user: TeamcraftUser): void {
    this.store.dispatch(new UpdateUser(user));
  }

  public login(email: string, password: string): Promise<UserCredential> {
    return this.af.signInWithEmailAndPassword(email, password);
  }

  public register(email: string, password: string): Promise<any> {
    return this.user$.pipe(
      first(),
      switchMap((user) => {
        return from(this.af.createUserWithEmailAndPassword(email, password)).pipe(
          tap(a => {
            this.store.dispatch(new RegisterUser(a.user.uid, user));
            this.store.dispatch(new ConvertLists(a.user.uid));
          })
        );
      })
    ).toPromise();
  }

  public googleOauth(): Observable<UserCredential> {
    return this.oauthService.loginWithGoogle();
  }

  public logout(): void {
    this.af.signOut().then(() => {
      this.store.dispatch(new Logout());
      window.location.reload();
    });
  }

  public toggleFavorite(dataType: keyof Favorites, key: string): void {
    this.store.dispatch(new ToggleFavorite(dataType, key));
  }

  public setCID(cid: string): void {
    this.store.dispatch(new SetCID(cid));
  }

  public setContentId(lodestoneId: number, contentId: string): void {
    this.store.dispatch(new SetContentId(lodestoneId, contentId));
  }

  public applyContentId(contentId: string): void {
    this.store.dispatch(new ApplyContentId(contentId));
    this.store.dispatch(new SetCID(contentId));
  }

  public setWorld(world: number): void {
    this.store.dispatch(new SetWorld(world));
  }

  public markAsDoneInLog(log: keyof LogTracking, itemId: number, done: boolean): void {
    this.store.dispatch(new MarkAsDoneInLog(log, itemId, done));
  }

  reloadGubalToken(): Observable<void> {
    return this.af.user.pipe(
      first(),
      switchMap(user => {
        return this.fns.httpsCallable('setCustomUserClaims')({
          uid: user.uid
        }).pipe(
          tap(() => {
            user.getIdTokenResult(true);
          })
        );
      })
    );
  }
}
