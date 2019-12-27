import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import {
  GetUser,
  LinkingCharacter,
  Logout,
  RegisterUser,
  RemoveCharacter,
  SaveDefaultConsumables,
  SaveSet,
  SetCID,
  SetCurrentFcId,
  SetDefaultCharacter,
  SetWorld,
  ToggleFavorite,
  ToggleMasterbooks,
  UpdateUser,
  VerifyCharacter
} from './auth.actions';
import { auth } from 'firebase/app';
import { UserCredential } from '@firebase/auth-types';
import { catchError, distinctUntilChanged, distinctUntilKeyChanged, filter, first, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { PlatformService } from '../core/tools/platform.service';
import { IpcService } from '../core/electron/ipc.service';
import { CharacterLinkPopupComponent } from '../core/auth/character-link-popup/character-link-popup.component';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, from, Observable, of } from 'rxjs';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { DefaultConsumables } from '../model/user/default-consumables';
import { Favorites } from '../model/other/favorites';
import { LodestoneIdEntry } from '../model/user/lodestone-id-entry';
import { OauthService } from '../core/auth/oauth.service';
import { ConvertLists } from '../modules/list/+state/lists.actions';
import { Character } from '@xivapi/angular-client';
import { UserService } from '../core/database/user.service';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {

  loaded$ = this.store.select(authQuery.getLoaded);
  linkingCharacter$ = this.store.select(authQuery.getLinkingCharacter);
  loggedIn$ = this.store.select(authQuery.getLoggedIn);
  userId$ = this.store.select(authQuery.getUserId).pipe(filter(uid => uid !== null));
  user$ = this.store.select(authQuery.getUser).pipe(filter(u => u !== undefined && u !== null));
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
      if (token.claims['https://hasura.io/jwt/claims'] === undefined) {
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
    shareReplay(1)
  );

  characters$ = this.user$.pipe(
    filter(u => u.lodestoneIds !== undefined),
    switchMap((user: TeamcraftUser) => {
      return combineLatest(user.lodestoneIds.map(entry => {
        if (entry.id > 0) {
          return this.userService.getCharacter(entry.id)
            .pipe(
              catchError(err => of(null))
            );
        }
        return of({
          Character: user.customCharacters.find(c => c.ID === entry.id)
        });
      }));
    }),
    map(characters => characters.filter(c => c !== null)),
    distinctUntilChanged((a, b) => a.length === b.length),
    shareReplay(1)
  );

  mainCharacterEntry$ = combineLatest([
    this.user$.pipe(
      distinctUntilKeyChanged('defaultLodestoneId')
    ),
    this.characters$
  ]).pipe(
    map(([user, characters]) => {
      const character = characters
        .filter(c => c.Character !== null)
        .find(char => char.Character.ID === user.defaultLodestoneId);
      const lodestoneIdEntry = user.lodestoneIds.find(entry => entry.id === user.defaultLodestoneId);
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
    })
  );

  fcId$ = combineLatest([this.mainCharacter$, this.user$]).pipe(
    distinctUntilChanged(([a], [b]) => {
      return a.FreeCompanyId === b.FreeCompanyId;
    }),
    map(([character, user]) => {
      if (!character || !character.FreeCompanyId || !character.FreeCompanyId
        || character.FreeCompanyId.toString() === user.currentFcId) {
        return null;
      }
      return character.FreeCompanyId.toString();
    }),
    tap(fcId => {
      if (fcId !== null) {
        this.store.dispatch(new SetCurrentFcId(fcId));
      }
    }),
    startWith('')
  );

  gearSets$ = this.loggedIn$.pipe(
    switchMap((loggedIn: boolean) => {
      if (loggedIn) {
        return this.mainCharacterEntry$;
      }
      return of(null);
    }),
    map((data: Partial<LodestoneIdEntry>) => {
      if (data === null) {
        data = { stats: [] };
      }
      const sets = data.stats || [];
      [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
        .filter(jobId => sets.find(set => set.jobId === jobId) === undefined)
        .forEach(jobId => {
          let classJob;
          if (data.character !== undefined) {
            classJob = data.character.ClassJobs && data.character.ClassJobs[`${jobId}_${jobId}`];
          }
          if (classJob === undefined) {
            sets.push({
              jobId: jobId,
              control: 0,
              craftsmanship: 0,
              cp: 180,
              level: 0,
              specialist: false
            });
          } else {
            sets.push({
              jobId: jobId,
              control: 0,
              craftsmanship: 0,
              cp: 180,
              level: classJob.Level,
              specialist: false
            });
          }
        });

      return sets.sort((a, b) => a.jobId - b.jobId);
    })
  );

  constructor(private store: Store<{ auth: AuthState }>, private af: AngularFireAuth,
              private platformService: PlatformService, private ipc: IpcService,
              private dialog: NzModalService, private translate: TranslateService,
              private oauthService: OauthService, private userService: UserService,
              private fns: AngularFireFunctions) {
    this.ipc.cid$.subscribe(packet => {
      this.setCID(packet.contentID);
    });

    this.ipc.worldId$.subscribe(worldId => {
      this.setWorld(worldId);
    });
  }

  resetPassword(email: string): void {
    this.af.auth.sendPasswordResetEmail(email);
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

  public saveSet(set: GearSet, ignoreSpecialist = false): void {
    this.store.dispatch(new SaveSet(set, ignoreSpecialist));
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
    return this.af.auth.signInWithEmailAndPassword(email, password);
  }

  public register(email: string, password: string): Promise<any> {
    return this.user$.pipe(
      first(),
      switchMap((user) => {
        return from(this.af.auth.createUserWithEmailAndPassword(email, password)).pipe(
          tap(a => {
            this.store.dispatch(new RegisterUser(a.user.uid, user));
            this.store.dispatch(new ConvertLists(a.user.uid));
          })
        );
      })
    ).toPromise();
  }

  public googleOauth(): Observable<UserCredential> {
    return this.oauthPopup(new auth.GoogleAuthProvider());
  }

  public facebookOauth(): Observable<UserCredential> {
    return this.oauthPopup(new auth.FacebookAuthProvider());
  }

  public logout(): void {
    this.af.auth.signOut().then(() => {
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

  public setWorld(world: number): void {
    this.store.dispatch(new SetWorld(world));
  }

  private oauthPopup(provider: any): Observable<UserCredential> {
    return this.oauthService.login(provider);
  }
}
