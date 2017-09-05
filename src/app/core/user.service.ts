import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {User} from '../model/user';
import {Observable} from 'rxjs/Observable';
import {DataService} from './data.service';

@Injectable()
export class UserService {

    private reloader: BehaviorSubject<void> = new BehaviorSubject(null);

    constructor(private af: AngularFireAuth,
                public firebase: AngularFireDatabase,
                private db: DataService) {
    }

    public getUser(): Observable<User> {
        return this.reloader
            .mergeMap(() => {
                return this.af.authState.mergeMap(user => {
                    if (user === null || user.isAnonymous) {
                        return Observable.of({name: 'Anonymous'});
                    } else {
                        return this.firebase
                            .object(`/users/${user.uid}`)
                            .catch(() => {
                                return Observable.of(null);
                            })
                            .mergeMap(u => {
                                if (u !== null && u.lodestoneId !== null && u.lodestoneId !== undefined) {
                                    return this.db.getCharacter(u.lodestoneId)
                                        .map(result => result.data);
                                } else {
                                    return Observable.of({name: 'Anonymous'});
                                }
                            });
                    }
                });
            });
    }

    public reload(): void {
        this.reloader.next(null);
    }
}
