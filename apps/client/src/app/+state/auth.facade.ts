import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import {
  GetUser,
  LinkingCharacter,
  Logout, RegisterUser,
  RemoveCharacter,
  SaveDefaultConsumables,
  SaveSet,
  SetCurrentFcId,
  SetDefaultCharacter,
  ToggleFavorite,
  ToggleMasterbooks,
  UpdateUser,
  VerifyCharacter
} from './auth.actions';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { UserCredential } from '@firebase/auth-types';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { PlatformService } from '../core/tools/platform.service';
import { IpcService } from '../core/electron/ipc.service';
import { CharacterLinkPopupComponent } from '../core/auth/character-link-popup/character-link-popup.component';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, of, from } from 'rxjs';
import { GearSet } from '../pages/simulator/model/gear-set';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { DefaultConsumables } from '../model/user/default-consumables';
import { Favorites } from '../model/other/favorites';
import { LodestoneIdEntry } from '../model/user/lodestone-id-entry';
import { OauthService } from '../core/auth/oauth.service';
import { first } from 'rxjs/operators';
import { ConvertLists } from '../modules/list/+state/lists.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  loaded$ = this.store.select(authQuery.getLoaded);
  mainCharacter$ = this.store.select(authQuery.getMainCharacter).pipe(filter(c => c !== null));
  linkingCharacter$ = this.store.select(authQuery.getLinkingCharacter);
  loggedIn$ = this.store.select(authQuery.getLoggedIn);
  userId$ = this.store.select(authQuery.getUserId).pipe(filter(uid => uid !== null));
  user$ = this.store.select(authQuery.getUser).pipe(filter(u => u !== undefined && u !== null));
  favorites$ = this.user$.pipe(map(user => user.favorites));
  fcId$ = this.store.select(authQuery.getMainCharacter).pipe(
    map((character) => {
      if (character === null || character.FreeCompanyId === undefined || character.FreeCompanyId === null) {
        return null;
      }
      return character.FreeCompanyId.toString();
    }),
    tap(fcId => {
      if (fcId !== null) {
        this.store.dispatch(new SetCurrentFcId(fcId));
      }
    })
  );
  characters$ = this.store.select(authQuery.getCharacters);
  mainCharacterEntry$ = combineLatest(this.mainCharacter$, this.user$).pipe(
    map(([char, user]) => {
      const lodestoneIdEntry = user.lodestoneIds.find(entry => entry.id === user.defaultLodestoneId);
      return {
        ...lodestoneIdEntry,
        character: char
      };
    })
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
              private oauthService: OauthService) {
  }

  resetPassword(email: string): void {
    this.af.auth.sendPasswordResetEmail(email);
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
          tap(auth => {
            this.store.dispatch(new RegisterUser(auth.user.uid, user));
            this.store.dispatch(new ConvertLists(auth.user.uid))
          })
        );
      }),
    ).toPromise();
  }

  public googleOauth(): Observable<UserCredential> {
    return this.oauthPopup(new firebase.auth.GoogleAuthProvider());
  }

  public facebookOauth(): Observable<UserCredential> {
    return this.oauthPopup(new firebase.auth.FacebookAuthProvider());
  }

  public logout(): void {
    this.af.auth.signOut();
    this.store.dispatch(new Logout());
  }

  public toggleFavorite(dataType: keyof Favorites, key: string): void {
    this.store.dispatch(new ToggleFavorite(dataType, key));
  }

  private oauthPopup(provider: any): Observable<UserCredential> {
    return this.oauthService.login(provider);
  }
}
