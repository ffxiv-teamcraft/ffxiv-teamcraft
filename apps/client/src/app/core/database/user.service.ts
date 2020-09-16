import { Injectable, NgZone } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { catchError, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { LogTrackingService } from './log-tracking.service';
import { CharacterResponse, XivapiService } from '@xivapi/angular-client';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirestoreStorage<TeamcraftUser> {

  userCache = {};

  characterCache: { [index: number]: Observable<CharacterResponse> } = {};

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private af: AngularFireAuth, private http: HttpClient,
              private logTrackingService: LogTrackingService, private xivapi: XivapiService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public cacheCharacter(charResponse: CharacterResponse): void {
    localStorage.setItem(`character:${charResponse.Character.ID}`, JSON.stringify(charResponse));
  }

  public getCachedCharacter(id: number): CharacterResponse | null {
    const data = localStorage.getItem(`character:${id}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  public getCharacter(id: number): Observable<CharacterResponse> {
    if (this.characterCache[id] === undefined) {
      this.characterCache[id] = this.xivapi.getCharacter(id).pipe(
        tap(char => this.cacheCharacter(char)),
        startWith(this.getCachedCharacter(id)),
        filter(res => res !== null),
        shareReplay(1)
      );
    }
    return this.characterCache[id];
  }

  public get(uid: string, external = false, isCurrentUser = false): Observable<TeamcraftUser> {
    if (this.userCache[uid] === undefined) {
      if (!uid) {
        return EMPTY;
      }
      this.userCache[uid] = super.get(uid).pipe(
        catchError((err) => {
          return of(null);
        }),
        switchMap(user => {
          if (user === null) {
            user = new TeamcraftUser();
            user.createdAt = firebase.firestore.Timestamp.now();
            user.notFound = true;
            user.$key = uid;
            return of(user);
          } else {
            delete user.notFound;
          }
          if (user.patreonToken === undefined) {
            user.patron = false;
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
        switchMap(user => {
          if (user.defaultLodestoneId && isCurrentUser) {
            return this.logTrackingService.get(`${user.$key}:${user.defaultLodestoneId.toString()}`).pipe(
              catchError((e) => {
                return of({
                  crafting: [],
                  gathering: []
                });
              }),
              map(logTracking => {
                user.logProgression = logTracking.crafting;
                user.gatheringLogProgression = logTracking.gathering;
                return user;
              })
            );
          }
          return of(user);
        }),
        map(user => {
          if (typeof user.createdAt !== 'object') {
            user.createdAt = firebase.firestore.Timestamp.fromDate(new Date(user.createdAt));
          } else if (!(user.createdAt instanceof firebase.firestore.Timestamp) && user.createdAt !== null) {
            user.createdAt = new firebase.firestore.Timestamp((user.createdAt as any).seconds, (user.createdAt as any).nanoseconds);
          } else {
            const probableDate = new Date();
            probableDate.setFullYear(2019);
            user.createdAt = firebase.firestore.Timestamp.fromDate(probableDate);
          }
          return user;
        }),
        shareReplay(1)
      );
    }
    return this.userCache[uid];
  }

  public getAllIds(): Observable<string[]> {
    return this.firestore.collection(this.getBaseUri()).get().pipe(
      tap(() => this.recordOperation('read')),
      map(snap => snap.docs.map(doc => doc.id))
    );
  }

  public set(uid: string, user: TeamcraftUser, ignoreLog = false): Observable<void> {
    if (!ignoreLog && user.defaultLodestoneId && (user.logProgression.length > 0 || user.gatheringLogProgression.length > 0)) {
      return this.logTrackingService.set(`${user.$key}:${user.defaultLodestoneId.toString()}`, {
        crafting: user.logProgression,
        gathering: user.gatheringLogProgression
      }).pipe(
        tap(() => this.recordOperation('write')),
        switchMap(() => {
          return super.set(uid, { ...user, gatheringLogProgression: [], logProgression: [] });
        })
      );
    }
    return super.set(uid, user);
  }

  /**
   * Checks if a given nickname is available.
   * @param {string} nickname
   * @returns {Observable<boolean>}
   */
  public checkNicknameAvailability(nickname: string): Observable<boolean> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('nickname', '==', nickname))
      .valueChanges()
      .pipe(
        tap(() => this.recordOperation('read')),
        map(res => res.length === 0)
      );
  }

  public getUsersByLodestoneId(id: number): Observable<TeamcraftUser[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('defaultLodestoneId', '==', id))
      .snapshotChanges()
      .pipe(
        tap(() => this.recordOperation('read')),
        map((snaps: any[]) => {
          const valueWithKey: TeamcraftUser[] = snaps.map(snap => ({ ...snap.payload.doc.data(), $key: snap.payload.doc.id }));
          return this.serializer.deserialize<TeamcraftUser>(valueWithKey, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(params?: any): string {
    return 'users';
  }

  protected getClass(): any {
    return TeamcraftUser;
  }
}
