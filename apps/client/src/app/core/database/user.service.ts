import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { AppUser } from '../../model/common/app-user';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirebaseStorage } from './storage/firebase/firebase-storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { map } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';

@Injectable()
export class UserService extends FirebaseStorage<TeamcraftUser> {

  constructor(private af: AngularFireAuth,
              protected database: AngularFireDatabase,
              protected serializer: NgSerializerService,
              protected pendingChangesService: PendingChangesService) {
    super(database, serializer, pendingChangesService);
  }

  public getUserByEmail(email: string): Observable<AppUser> {
    return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('email').equalTo(email))
      .snapshotChanges()
      .pipe(
        map(snaps => snaps[0]),
        map(snap => {
          const valueWithKey: AppUser = { $key: snap.payload.key, ...snap.payload.val() };
          if (!snap.payload.exists()) {
            throw new Error('Not found');
          }
          delete snap.payload;
          return this.serializer.deserialize<AppUser>(valueWithKey, this.getClass());
        })
      );
  }

  /**
   * Gets user ingame informations.
   * @returns {Observable<any>}
   */

  // public getCharacterWithoutCache(): Observable<any> {
  //     return this.getUserData()
  //         .pipe(
  //             mergeMap(user => {
  //                 return this.dataService.getCharacter(user.lodestoneId, true);
  //             })
  //         );
  // }

  /**
   * Returns user data informations.
   * @returns {Observable<AppUser>}
   */
  // public getUserData(): Observable<AppUser> {
  //     return this.reloader
  //         .pipe(
  //             filter(() => !this.loggingIn),
  //             switchMap(() => {
  //                 return this.af.authState
  //                     .pipe(
  //                         first(),
  //                         mergeMap((user) => {
  //                             if ((user === null && !this.loggingIn) || user.uid === undefined) {
  //                                 this.af.auth.signInAnonymously();
  //                                 return of(<AppUser>{name: 'Anonymous', anonymous: true});
  //                             }
  //                             if (user === null || user.isAnonymous) {
  //                                 return this.get(user.uid).pipe(
  //                                     catchError(() => {
  //                                         return of(<AppUser>{$key: user.uid, name: 'Anonymous', anonymous: true});
  //                                     }));
  //                             } else {
  //                                 return this.get(user.uid)
  //                                     .pipe(
  //                                         map(u => {
  //                                             return u;
  //                                         })
  //                                     );
  //                             }
  //                         })
  //                     );
  //             }),
  //             mergeMap((u: AppUser) => {
  //                 u.patron = false;
  //                 if (u.patreonEmail === undefined) {
  //                     return of(u);
  //                 }
  //                 return this.firebase.list('/patreon/supporters').valueChanges()
  //                     .pipe(
  //                         map((supporters: { email: string }[]) => {
  //                             u.patron = supporters.find(s => s.email.toLowerCase() === u.patreonEmail.toLowerCase()) !== undefined;
  //                             return u;
  //                         })
  //                     );
  //             })
  //         );
  // }

  /**
   * Checks if a given email is available for patreon account linking.
   * @param {string} email
   * @returns {Observable<boolean>}
   */
  public checkPatreonEmailAvailability(email: string): Observable<boolean> {
    return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('patreonEmail').equalTo(email))
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
    return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('nickname').equalTo(nickname))
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

  protected getBaseUri(params?: any): string {
    return 'users';
  }

  protected getClass(): any {
    return TeamcraftUser;
  }
}
