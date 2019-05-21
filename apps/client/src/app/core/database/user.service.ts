import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { map, switchMap } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService extends FirestoreStorage<TeamcraftUser> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private af: AngularFireAuth, private http: HttpClient) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getUserByEmail(email: string): Observable<TeamcraftUser> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('email', '==', email))
      .snapshotChanges()
      .pipe(
        map(snaps => snaps[0]),
        map((snap: any) => {
          const valueWithKey: TeamcraftUser = { $key: snap.payload.doc.id, ...snap.payload.doc.data() };
          if (!snap.payload.exists()) {
            throw new Error('Not found');
          }
          delete snap.payload;
          return this.serializer.deserialize<TeamcraftUser>(valueWithKey, this.getClass());
        })
      );
  }

  public get(uid: string): Observable<TeamcraftUser> {
    return super.get(uid).pipe(
      switchMap(user => {
        if (user === null) {
          return of(new TeamcraftUser());
        }
        if (user.lodestoneIds.length === 0 && (
          user.gatheringLogProgression.length > 0
          || user.logProgression.length > 0
          || user.currentFcId
          || user.contacts.length > 0
        )) {
          throw new Error('Network error, logging the user out to avoid data loss');
        }
        user.createdAt = new Date(user.createdAt);
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
      })
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
        map(res => res.length === 0)
      );
  }

  /**
   * Updates email associated with a given account.
   * @param {string} currentMail
   * @param {string} password
   * @param {string} newMail
   * @returns {Promise<void>}
   */
  public changeEmail(currentMail: string, password: string, newMail: string): Promise<void> {
    return this.af.auth.signInWithEmailAndPassword(currentMail, password).then(user => {
      user.user.updateEmail(newMail)
        .then(() => user.user.sendEmailVerification());
    });
  }

  public getUsersByLodestoneId(id: number): Observable<TeamcraftUser[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('defaultLodestoneId', '==', id))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => {
          const valueWithKey: TeamcraftUser[] = snaps.map(snap => ({ $key: snap.payload.doc.id, ...snap.payload.doc.data() }));
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
