import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppUser} from '../model/list/app-user';
import {Observable} from 'rxjs/Observable';
import {DataService} from './api/data.service';
import {catchError} from 'rxjs/operators';

@Injectable()
export class UserService {

    private reloader: BehaviorSubject<void> = new BehaviorSubject(null);

    constructor(private af: AngularFireAuth,
                public firebase: AngularFireDatabase,
                private db: DataService) {
    }

    public getUser(): Observable<AppUser> {
        return this.getUserData()
            .switchMap(u => {
                if (u !== null && u.lodestoneId !== null && u.lodestoneId !== undefined) {
                    return this.db.getCharacter(u.lodestoneId);
                } else {
                    return Observable.of({name: 'Anonymous'});
                }
            });
    }

    public getUserData(): Observable<AppUser> {
        return this.reloader
            .switchMap(() => {
                return this.af.authState.switchMap(user => {
                    if (user === null || user.isAnonymous) {
                        return Observable.of({name: 'Anonymous'});
                    } else {
                        return this.firebase
                            .object(`/users/${user.uid}`)
                            .valueChanges()
                            .pipe(
                                catchError(() => {
                                    return Observable.of(null);
                                })
                            );
                    }
                });
            });
    }

    public reload(): void {
        this.reloader.next(null);
    }

    saveUser(uid: string, userData: AppUser) {
        return this.firebase
            .object(`/users/${uid}`)
            .update(userData);
    }
}
