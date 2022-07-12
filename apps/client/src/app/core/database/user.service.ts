import { Injectable, NgZone } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { catchError, distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirestoreStorage<TeamcraftUser> {

  userCache = {};

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private af: AngularFireAuth, private http: HttpClient) {
    super(firestore, serializer, zone, pendingChangesService);
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
        distinctUntilChanged((a, b) => {
          return JSON.stringify(a) === JSON.stringify(b);
        }),
        switchMap(user => {
          if (user === null) {
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

  public getAllIds(): Observable<string[]> {
    return this.firestore.collection(this.getBaseUri()).get().pipe(
      tap(() => this.recordOperation('read')),
      map(snap => snap.docs.map(doc => doc.id))
    );
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

  protected prepareData(data: any): any {
    delete data.logProgression;
    delete data.gatheringLogProgression;
    return super.prepareData(data);
  }

  protected getBaseUri(params?: any): string {
    return 'users';
  }

  protected getClass(): any {
    return TeamcraftUser;
  }
}
