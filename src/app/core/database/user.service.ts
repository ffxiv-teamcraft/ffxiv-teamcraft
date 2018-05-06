import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppUser} from '../../model/list/app-user';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../api/data.service';
import {ListService} from './list.service';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {FirebaseStorage} from './storage/firebase/firebase-storage';
import {AngularFireDatabase} from 'angularfire2/database';
import {DiffService} from './diff/diff.service';
import {PendingChangesService} from './pending-changes/pending-changes.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/concat';

@Injectable()
export class UserService extends FirebaseStorage<AppUser> {

    public loggingIn = false;

    private reloader: BehaviorSubject<void> = new BehaviorSubject(null);

    constructor(private af: AngularFireAuth,
                protected database: AngularFireDatabase,
                private dataService: DataService,
                private listService: ListService,
                protected serializer: NgSerializerService,
                protected diffService: DiffService,
                protected zone: NgZone,
                protected pendingChangesService: PendingChangesService) {
        super(database, serializer, diffService, zone, pendingChangesService);
    }

    public set(uid: string, user: AppUser): Observable<void> {
        return super.set(uid, user).do(() => this.reload());
    }

    public getUserByEmail(email: string): Observable<AppUser> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('email').equalTo(email))
            .snapshotChanges()
            .map(snaps => snaps[0])
            .map(snap => {
            const valueWithKey: AppUser = {$key: snap.payload.key, ...snap.payload.val()};
            if (!snap.payload.exists()) {
                throw new Error('Not found');
            }
            delete snap.payload;
            return this.serializer.deserialize<AppUser>(valueWithKey, this.getClass());
        })
    }

    /**
     * Gets user ingame informations.
     * @returns {Observable<any>}
     */
    public getCharacter(uid?: string): Observable<any> {
        let userData: Observable<AppUser>;
        if (uid === undefined) {
            userData = this.getUserData();
        } else {
            userData = this.get(uid);
        }
        return userData
            .mergeMap(u => {
                if (u !== null && u.lodestoneId !== null && u.lodestoneId !== undefined) {
                    return this.dataService.getCharacter(u.lodestoneId).map(c => {
                        c.patron = u.patron;
                        c.patreonEmail = u.patreonEmail;
                        c.nickname = u.nickname;
                        return c;
                    });
                } else {
                    return Observable.of({name: 'Anonymous'});
                }
            });
    }

    /**
     * Returns user data informations.
     * @returns {Observable<AppUser>}
     */
    public getUserData(): Observable<AppUser> {
        return this.reloader
            .filter(() => !this.loggingIn)
            .switchMap(() => {
                return this.af.authState.first()
                    .mergeMap(user => {
                        if ((user === null && !this.loggingIn) || user.uid === undefined) {
                            this.af.auth.signInAnonymously();
                            return Observable.of(<AppUser>{name: 'Anonymous', anonymous: true});
                        }
                        if (user === null || user.isAnonymous) {
                            return this.get(user.uid).catch(() => {
                                return Observable.of(<AppUser>{$key: user.uid, name: 'Anonymous', anonymous: true});
                            });
                        } else {
                            return this.get(user.uid).map(u => {
                                u.providerId = user.providerId;
                                return u;
                            });
                        }
                    });
            })
            .mergeMap(u => {
                u.patron = false;
                if (u.patreonEmail === undefined) {
                    return Observable.of(u);
                }
                return this.firebase.list('/patreon/supporters').valueChanges().map((supporters: { email: string }[]) => {
                    u.patron = supporters.find(s => s.email.toLowerCase() === u.patreonEmail.toLowerCase()) !== undefined;
                    return u;
                });
            });
    }

    /**
     * Trigegrs subscriptions reload.
     */
    public reload(): void {
        this.reloader.next(null);
    }

    /**
     * Checks if a given email is available for patreon account linking.
     * @param {string} email
     * @returns {Observable<boolean>}
     */
    public checkPatreonEmailAvailability(email: string): Observable<boolean> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('patreonEmail').equalTo(email))
            .valueChanges()
            .map(res => res.length === 0);
    }

    /**
     * Checks if a given nickname is available.
     * @param {string} nickname
     * @returns {Observable<boolean>}
     */
    public checkNicknameAvailability(nickname: string): Observable<boolean> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('nickname').equalTo(nickname))
            .valueChanges()
            .map(res => res.length === 0);
    }


    /**
     * Deletes a user based on his id, deleting all of his lists at the same time.
     * @param {string} uid
     * @returns {Promise<void>}
     */
    public deleteUser(uid: string): Promise<void> {
        return new Promise<void>(resolve => {
            this.listService.getUserLists(uid).subscribe(lists => {
                if (lists === []) {
                    return this.remove(uid).first().subscribe(resolve);
                } else {
                    return this.listService.deleteUserLists(uid).subscribe(resolve);
                }
            });
        });
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
            user.updateEmail(newMail)
                .then(() => user.sendEmailVerification());
        });
    }

    /**
     * Signs out the current user.
     * @returns {Observable<void>}
     */
    public signOut(): Observable<void> {
        return Observable.concat(
            Observable.fromPromise(this.af.auth.signOut()),
            Observable.fromPromise(this.af.auth.signInAnonymously()))
            .do(() => this.reload());
    }

    protected getBaseUri(params?: any): string {
        return 'users';
    }

    protected getClass(): any {
        return AppUser;
    }
}
