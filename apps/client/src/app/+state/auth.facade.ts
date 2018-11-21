import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import {
  GetUser,
  LinkingCharacter,
  Logout,
  RemoveCharacter,
  SaveSet,
  SetCurrentFcId,
  SetDefaultCharacter,
  ToggleFavorite,
  ToggleMasterbooks,
  UpdateUser,
  VerifyCharacter
} from './auth.actions';
import { auth } from 'firebase';
import { UserCredential } from '@firebase/auth-types';
import { filter, map, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { PlatformService } from '../core/tools/platform.service';
import { IpcService } from '../core/electron/ipc.service';
import { CharacterLinkPopupComponent } from '../core/auth/character-link-popup/character-link-popup.component';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { GearSet } from '../pages/simulator/model/gear-set';
import { TeamcraftUser } from '../model/user/teamcraft-user';

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
      if (character === null || character.FreeCompanyId === undefined) {
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
  gearSets$ = this.mainCharacterEntry$.pipe(
    map(data => {
      const sets = data.stats || [];
      [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
        .filter(jobId => sets.find(set => set.jobId === jobId) === undefined)
        .forEach(jobId => {
          const classJob = data.character.ClassJobs && data.character.ClassJobs[`${jobId}_${jobId}`];
          if (classJob === undefined) {
            sets.push({
              jobId: jobId,
              control: 0,
              craftsmanship: 0,
              cp: 0,
              level: 0,
              specialist: false
            });
          } else {
            sets.push({
              jobId: jobId,
              control: 0,
              craftsmanship: 0,
              cp: 0,
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
              private dialog: NzModalService, private translate: TranslateService) {
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

  public saveSet(set: GearSet): void {
    this.store.dispatch(new SaveSet(set));
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
    return this.af.auth.createUserWithEmailAndPassword(email, password);
  }

  public googleOauth(): Promise<UserCredential> {
    return this.oauthPopup(new auth.GoogleAuthProvider());
  }

  public facebookOauth(): Promise<UserCredential> {
    return this.oauthPopup(new auth.FacebookAuthProvider());
  }

  public logout(): void {
    this.af.auth.signOut();
    this.store.dispatch(new Logout());
  }

  public toggleFavorite(dataType: 'lists' | 'workshops', key: string): void {
    this.store.dispatch(new ToggleFavorite(dataType, key));
  }

  private oauthPopup(provider: any): Promise<UserCredential> {
    return new Promise((resolve, reject) => {
      let signInPromise: Promise<any>;
      // If we're running inside electron, we need a special implementation.
      if (this.platformService.isDesktop()) {
        signInPromise = new Promise((innerResolve) => {
          this.ipc.on('oauth-reply', (event, { access_token }) => {
            this.af.auth
              .signInAndRetrieveDataWithCredential(provider.credential(null, access_token))
              .then(result => innerResolve(result));
          });
        });
        this.ipc.send('oauth', provider.providerId);
      } else {
        signInPromise = this.af.auth.signInWithPopup(provider);
      }
      return signInPromise.then((oauth) => {
        resolve(oauth);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}
