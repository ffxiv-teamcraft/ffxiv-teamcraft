import {Injectable, NgZone} from '@angular/core';
import {FirestoreStorage} from './storage/firebase/firestore-storage';
import {Team} from '../../model/other/team';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {PendingChangesService} from './pending-changes/pending-changes.service';
import {UserService} from './user.service';
import {Observable} from 'rxjs/index';
import {map, mergeMap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TeamService extends FirestoreStorage<Team> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService, private userService: UserService) {
        super(firestore, serializer, zone, pendingChangesService);
    }

    public getUserTeams(): Observable<Team[]> {
        return this.userService.getUserData().pipe(
            mergeMap(user => {
                return this.firestore
                    .collection(this.getBaseUri(), ref => ref.where(`members.${user.$key}`, '==', true))
                    .snapshotChanges()
                    .pipe(
                        map(snaps => snaps.map(snap => {
                            const data = snap.payload.doc.data();
                            delete data.$key;
                            return (<Team>{$key: snap.payload.doc.id, ...data})
                        })),
                        map(teams => this.serializer.deserialize<Team>(teams, [Team]))
                    );
            })
        );
    }

    protected getBaseUri(params?: any): string {
        return 'teams';
    }

    protected getClass(): any {
        return Team;
    }
}
