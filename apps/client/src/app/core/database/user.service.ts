import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { HttpClient } from '@angular/common/http';
import { Firestore, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { addMonths } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirestoreStorage<TeamcraftUser> {

  reloader$ = new BehaviorSubject<void>(void 0);

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
      this.userCache[uid] = this.reloader$.pipe(
        switchMap(() => {
          return super.get(uid).pipe(
            catchError(() => {
              return of(null);
            }),
            switchMap(user => {
              if (!user || user.notFound) {
                user = new TeamcraftUser();
                user.notFound = true;
                user.$key = uid;
                return of(user);
              } else {
                delete user.notFound;
              }
              if (!user.patreonToken && !user.tipeeeToken && !user.patreonBenefitsUntil) {
                user.supporter = false;
                return of(user);
              }
              if (user.patreonBenefitsUntil) {
                user.supporter = user.patreonBenefitsUntil.seconds * 1000 >= Date.now();
                if (user.supporter) {
                  return of(user);
                }
              }
              return combineLatest([
                user.patreonToken ? this.http.get<any>(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-pledges?token=${user.patreonToken}`) : of(null),
                user.tipeeeToken ? this.http.get<any>(`https://api.tipeee.com/v2.0/partners/tips?access_token=${user.tipeeeToken}&cache_bust=${Date.now()}`) : of(null)
              ]).pipe(
                map(([patreon, tipeee]) => {
                  const patreonSupporter = patreon?.included?.some(e => e.attributes?.patron_status === 'active_patron');
                  const tipeeeSupporter = tipeee && tipeee.items.some(i => i.donation_type === 'PER_MONTH' && i.is_active);
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
