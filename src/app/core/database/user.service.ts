import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppUser} from '../../model/list/app-user';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../api/data.service';
import {AngularFirestore} from 'angularfire2/firestore';
import {ListService} from './list.service';
import {FirestoreStorage} from './storage/firestore/firestore-storage';
import {NgSerializerService} from '@kaiu/ng-serializer';

@Injectable()
export class UserService extends FirestoreStorage<AppUser> {

    public loggingIn = false;

    private reloader: BehaviorSubject<void> = new BehaviorSubject(null);

    constructor(private af: AngularFireAuth,
                protected database: AngularFirestore,
                private dataService: DataService,
                private listService: ListService,
                protected serializer: NgSerializerService) {
        super(database, serializer);
    }

    /**
     * Gets user ingame informations.
     * @returns {Observable<any>}
     */
    public getCharacter(): Observable<any> {
        return this.getUserData()
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
                return this.af.authState.switchMap(user => {
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
                    return this.listService.deleteUserLists(uid);
                }
            });
        });
    }

    protected getBaseUri(params?: any): Observable<string> {
        return Observable.of('users');
    }

    protected getClass(): any {
        return AppUser;
    }
}
