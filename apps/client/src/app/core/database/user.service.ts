import { Injectable, NgZone } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { catchError, distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { HttpClient } from '@angular/common/http';
import { Firestore, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { isEqual } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirestoreStorage<TeamcraftUser> {

  userCache = {};

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private auth: Auth, private http: HttpClient) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public get(uid: string, external = false, isCurrentUser = false): Observable<TeamcraftUser> {
    if (this.userCache[uid] === undefined) {
      if (!uid) {
        return EMPTY;
      }
      this.userCache[uid] = super.get(uid).pipe(
        catchError(() => {
          return of(null);
        }),
        distinctUntilChanged(isEqual),
        switchMap(user => {
          if (!user) {
            user = new TeamcraftUser();
            user.notFound = true;
            user.$key = uid;
            return of(user);
          } else {
            delete user.notFound;
          }
          if (!user.patreonToken && !user.patreonBenefitsUntil) {
            user.patron = false;
            return of(user);
          }
          if (user.patreonBenefitsUntil) {
            user.patron = user.patreonBenefitsUntil.seconds * 1000 >= Date.now();
            return of(user);
          }
          return this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-pledges?token=${user.patreonToken}`).pipe(
            map((response: any) => {
              user.patron = response.included && response.included[0] && response.included[0].attributes &&
                response.included[0].attributes.patron_status === 'active_patron';
              return user;
            })
          );
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.userCache[uid];
  }

  /**
   * Checks if a given nickname is available.
   * @param {string} nickname
   * @returns {Observable<boolean>}
   */
  public checkNicknameAvailability(nickname: string): Observable<boolean> {
    return this.query(where('nickname', '==', nickname))
      .pipe(
        tap(() => this.recordOperation('read')),
        map(res => res.length === 0)
      );
  }

  public getUsersByLodestoneId(id: number): Observable<TeamcraftUser[]> {
    return this.query(where('defaultLodestoneId', '==', id))
      .pipe(
        tap(() => this.recordOperation('read'))
      );
  }

  protected prepareData(data: any): any {
    delete data.logProgression;
    delete data.gatheringLogProgression;
    return super.prepareData(data);
  }

  protected getBaseUri(): string {
    return 'users';
  }

  protected getClass(): any {
    return TeamcraftUser;
  }
}
