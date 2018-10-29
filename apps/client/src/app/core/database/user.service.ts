import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { map } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class UserService extends FirestoreStorage<TeamcraftUser> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private af: AngularFireAuth) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getUserByEmail(email: string): Observable<TeamcraftUser> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('email', '==', email))
      .snapshotChanges()
      .pipe(
        map(snaps => snaps[0]),
        map((snap: any) => {
          const valueWithKey: TeamcraftUser = { $key: snap.payload.key, ...snap.payload.val() };
          if (!snap.payload.exists()) {
            throw new Error('Not found');
          }
          delete snap.payload;
          return this.serializer.deserialize<TeamcraftUser>(valueWithKey, this.getClass());
        })
      );
  }

  /**
   * Checks if a given email is available for patreon account linking.
   * @param {string} email
   * @returns {Observable<boolean>}
   */
  public checkPatreonEmailAvailability(email: string): Observable<boolean> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('patreonEmail', '==', email))
      .valueChanges()
      .pipe(
        map(res => res.length === 0)
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
   * Deletes a user based on his id, deleting all of his lists at the same time.
   * @param {string} uid
   * @returns {Promise<void>}
   */
  public deleteUser(uid: string): void {
    // return new Promise<void>(resolve => {
    //     this.listService.getUserLists(uid).subscribe(lists => {
    //         if (lists === []) {
    //             return this.remove(uid).pipe(first()).subscribe(resolve);
    //         } else {
    //             return this.listService.deleteUserLists(uid).subscribe(resolve);
    //         }
    //     });
    // });
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
          const valueWithKey: TeamcraftUser[] = snaps.map(snap => ({ $key: snap.payload.key, ...snap.payload.val() }));
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
