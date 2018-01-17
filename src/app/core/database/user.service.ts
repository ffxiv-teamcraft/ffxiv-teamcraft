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
                protected zone: NgZone) {
        super(database, serializer, diffService, zone);
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
            .switchMap(u => {
                if (u !== null && u.lodestoneId !== null && u.lodestoneId !== undefined) {
                    return this.dataService.getCharacter(u.lodestoneId).map(c => {
                        c.patron = u.patron;
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
            .switchMap(() => {
                return this.af.authState.first().switchMap(user => {
                    if (user === null && !this.loggingIn) {
                        this.af.auth.signInAnonymously();
                        return Observable.of({name: 'Anonymous', anonymous: true});
                    }
                    if (user === null || user.isAnonymous) {
                        return Observable.of({$key: user.uid, name: 'Anonymous', anonymous: true});
                    } else {
                        return this.get(user.uid);
                    }
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
