import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, from, Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { catchError, debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { HttpClient } from '@angular/common/http';
import {
  collection,
  deleteField,
  doc,
  docSnapshots,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { addMonths } from 'date-fns';
import { isEqual } from 'lodash';
import { hasLegacyPrivateData, mergeUserData, splitUserData } from '../../model/user/user-private-data';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirestoreStorage<TeamcraftUser> {

  reloader$ = new BehaviorSubject<void>(void 0);

  userCache = {};

  private migrating = new Set<string>();

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService, private http: HttpClient, private auth: Auth) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  /**
   * Loads a user. The signed-in user (`isCurrentUser`) also gets its private profile, which only they can read.
   */
  public get(uid: string, external = false, isCurrentUser = false): Observable<TeamcraftUser> {
    if (!uid) {
      return EMPTY;
    }
    const cacheKey = isCurrentUser ? `${uid}:self` : uid;
    if (this.userCache[cacheKey] === undefined) {
      this.userCache[cacheKey] = this.reloader$.pipe(
        switchMap(() => isCurrentUser ? this.getCurrentUser(uid) : this.getPublicUser(uid)),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.userCache[cacheKey];
  }

  /**
   * Saves a user. For the signed-in user, private fields go to `users/{uid}/private/profile` and are removed
   * from the public document, in a single batch.
   */
  public set(key: string, data: TeamcraftUser): Observable<void> {
    if (this.auth.currentUser?.uid !== key) {
      return super.set(key, data);
    }
    const { publicData, privateData } = splitUserData(data);
    const batch = writeBatch(this.firestore);
    batch.set(this.docRef(key), publicData as TeamcraftUser);
    // Users created without loading a private profile (new accounts) have nothing private to save yet.
    if (data.privateDataLoaded) {
      batch.set(this.privateProfileRef(key), JSON.parse(JSON.stringify(privateData)));
    }
    this.pendingChangesService.addPendingChange(`set users/${key}`);
    return this.zone.runOutsideAngular(() => {
      return from(batch.commit()).pipe(
        catchError(error => {
          console.error(`UPDATE users/${key}`);
          console.error(error);
          throw error;
        }),
        tap(() => {
          this.recordOperation('write', key);
          this.pendingChangesService.removePendingChange(`set users/${key}`);
        })
      );
    });
  }

  /**
   * Deletes the signed-in user's public document, private profile and Kickstarter email claim.
   */
  public deleteUser(user: TeamcraftUser): Observable<void> {
    const claim$ = user.ksEmail ? from(this.getKsEmailRef(user.ksEmail)).pipe(
      switchMap(ref => from(getDoc(ref)).pipe(
        map(snap => snap.exists() && snap.data().uid === user.$key ? ref : null)
      ))
    ) : of(null);
    return claim$.pipe(
      switchMap(claimRef => {
        const batch = writeBatch(this.firestore);
        if (claimRef) {
          batch.delete(claimRef);
        }
        batch.delete(this.privateProfileRef(user.$key));
        batch.delete(this.docRef(user.$key));
        return from(batch.commit());
      }),
      tap(() => {
        this.recordOperation('delete', user.$key);
        delete this.cache[user.$key];
      })
    );
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

  /**
   * Verifies a Kickstarter backer email and reserves it for the user.
   * The caller is responsible for saving `ksEmail` and `backer` on the user once this resolves to true.
   */
  public checkKsEmailAvailability(uid: string, email: string): Observable<boolean> {
    return this.http.get<{ check: boolean }>('https://ks-api.ffxivteamcraft.com/check', { params: { email } }).pipe(
      switchMap(({ check }) => check ? this.claimKsEmail(uid, email) : of(false))
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
    delete data.privateDataLoaded;
    return super.prepareData(data);
  }

  protected getBaseUri(): string {
    return 'users';
  }

  protected getClass(): any {
    return TeamcraftUser;
  }

  private getPublicUser(uid: string): Observable<TeamcraftUser> {
    return super.get(uid).pipe(
      catchError(() => {
        return of(null);
      }),
      switchMap(user => {
        if (!user || user.notFound) {
          return of(this.createNotFoundUser(uid));
        }
        delete user.notFound;
        return this.applySupporterStatus(user, false);
      })
    );
  }

  private getCurrentUser(uid: string): Observable<TeamcraftUser> {
    return combineLatest([
      this.getSnapshotData(doc(this.firestore, 'users', uid)),
      this.getSnapshotData(this.privateProfileRef(uid)).pipe(
        catchError(error => {
          console.error(`GET users/${uid}/private/profile`);
          console.error(error);
          return of(undefined);
        })
      )
    ]).pipe(
      // Both documents change together when saved; wait for both snapshots.
      debounceTime(50),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(([publicData, privateData]) => {
        if (publicData === undefined) {
          return of(this.createNotFoundUser(uid));
        }
        const user = this.serializer.deserialize<TeamcraftUser>({ ...mergeUserData(publicData, privateData), $key: uid } as TeamcraftUser, TeamcraftUser);
        user.privateDataLoaded = true;
        return this.applySupporterStatus(user, true).pipe(
          tap(computedUser => {
            if (hasLegacyPrivateData(publicData)) {
              this.migratePrivateData(uid, computedUser);
            } else {
              this.saveSupporterStatus(uid, publicData, computedUser);
            }
          })
        );
      })
    );
  }

  /**
   * Moves private data left on the public document (never migrated, or written by an older client) to the private profile.
   */
  private migratePrivateData(uid: string, user: TeamcraftUser): void {
    if (this.migrating.has(uid)) {
      return;
    }
    this.migrating.add(uid);
    this.set(uid, user).pipe(
      catchError(error => {
        console.error(`Failed to move private data of user ${uid}`, error);
        return EMPTY;
      })
    ).subscribe({
      complete: () => this.migrating.delete(uid)
    });
    if (user.ksEmail) {
      this.claimKsEmail(uid, user.ksEmail).pipe(
        catchError(() => of(false))
      ).subscribe();
    }
  }

  /**
   * Stores the signed-in user's supporter status on their public document, which is what other users read.
   */
  private saveSupporterStatus(uid: string, publicData: DocumentData, user: TeamcraftUser): void {
    const supporter = !!user.supporter;
    const supporterUntil = user.supporterUntil || null;
    if (!!publicData.supporter === supporter && (publicData.supporterUntil || null) === supporterUntil) {
      return;
    }
    this.pureUpdate(uid, { supporter, supporterUntil: supporterUntil || deleteField() } as any).pipe(
      catchError(() => EMPTY)
    ).subscribe();
  }

  private applySupporterStatus(user: TeamcraftUser, isCurrentUser: boolean): Observable<TeamcraftUser> {
    if (user.patreonBenefitsUntil) {
      user.supporter = user.patreonBenefitsUntil.seconds * 1000 >= Date.now();
      if (user.supporter) {
        return of(user);
      }
    }
    if (!user.patreonToken && !user.tipeeeToken) {
      // Tokens are private: other users rely on the status stored by the user's own client.
      user.supporter = (!isCurrentUser && !!user.supporter) || user.supporterUntil > Date.now();
      return of(user);
    }
    const tipeeeSource$ = this.http.get<any>(`https://api.tipeee.com/v2.0/partners/tips?access_token=${user.tipeeeToken}`).pipe(
      catchError(err => {
        return of(null);
      })
    );
    return combineLatest([
      user.patreonToken ? this.http.get<any>(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-pledges?token=${user.patreonToken}`) : of(null),
      user.tipeeeToken ? tipeeeSource$ : of(null)
    ]).pipe(
      map(([patreon, tipeee]) => {
        const patreonSupporter = patreon?.included?.some(e => e.attributes?.patron_status === 'active_patron');
        const tipeeeSupporter = tipeee && tipeee.items?.some(i => i.donation_type === 'PER_MONTH' && i.is_active);
        if (tipeee && !tipeeeSupporter) {
          user.supporterUntil = tipeee.items
            // Only take direct donations into consideration
            .filter(i => i.donation_type === 'DIRECT_MONTH')
            // From the donation, compute end of supporter status based on donation date + <€ amount> months
            .map(tip => addMonths(new Date(tip.start_at), Math.ceil(tip.amount)).getTime())
            // Grab the highest timestamp produced
            .sort((a, b) => b - a)[0];
        }
        user.supporter = patreonSupporter || tipeeeSupporter || user.supporterUntil > Date.now();
        return user;
      })
    );
  }

  /**
   * Reserves a Kickstarter email for a user. Resolves to false if another user already has it.
   * Claims are keyed by a hash of the email so they can be checked without being listed.
   */
  private claimKsEmail(uid: string, email: string): Observable<boolean> {
    return from(this.getKsEmailRef(email)).pipe(
      switchMap(ref => combineLatest([
        from(getDoc(ref)),
        // Users who haven't migrated yet still have their email on the public document.
        from(getDocs(query(collection(this.firestore, 'users'), where('ksEmail', '==', email))))
      ]).pipe(
        tap(() => this.recordOperation('read')),
        switchMap(([claim, legacyUsers]) => {
          const claimedByOther = claim.exists() && claim.data().uid !== uid;
          if (claimedByOther || legacyUsers.docs.some(legacyUser => legacyUser.id !== uid)) {
            return of(false);
          }
          if (claim.exists()) {
            return of(true);
          }
          return from(setDoc(ref, { uid })).pipe(map(() => true));
        })
      ))
    );
  }

  private async getKsEmailRef(email: string): Promise<DocumentReference> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.trim().toLowerCase()));
    const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return doc(this.firestore, 'ks-emails', hash);
  }

  private privateProfileRef(uid: string): DocumentReference {
    return doc(this.firestore, 'users', uid, 'private', 'profile');
  }

  private getSnapshotData(ref: DocumentReference): Observable<DocumentData | undefined> {
    return docSnapshots(ref).pipe(
      filter(snap => !snap.metadata.hasPendingWrites),
      map(snap => snap.data()),
      tap(() => this.recordOperation('read', ref.path))
    );
  }

  private createNotFoundUser(uid: string): TeamcraftUser {
    const user = new TeamcraftUser();
    user.notFound = true;
    user.$key = uid;
    return user;
  }
}
