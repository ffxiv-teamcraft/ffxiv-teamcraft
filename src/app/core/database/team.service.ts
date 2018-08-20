import {Injectable, NgZone} from '@angular/core';
import {FirestoreStorage} from './storage/firebase/firestore-storage';
import {Team} from '../../model/other/team';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {PendingChangesService} from './pending-changes/pending-changes.service';
import {UserService} from './user.service';
import {combineLatest, Observable, of} from 'rxjs/index';
import {map, mergeMap, shareReplay} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TeamService extends FirestoreStorage<Team> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService, private userService: UserService) {
        super(firestore, serializer, zone, pendingChangesService);
    }

    public isPremium(team: Team): Observable<boolean> {
        const members = Object.keys(team.members).filter(userId => team.isConfirmed(userId));
        return combineLatest(members.map(member => this.userService.get(member)))
            .pipe(
                map(resultMembers => {
                    // return resultMembers.reduce((premium, m) => premium || m.patron || m.admin, false);
                    return false;
                })
            );
    }

    public getUserTeams(): Observable<Team[]> {
        return of([]);
        // return this.userService.getUserData().pipe(
        //     mergeMap(user => {
        //         return this.firestore
        //             .collection(this.getBaseUri(), ref => ref.where(`members.${user.$key}`, '>=', -1))
        //             .snapshotChanges()
        //             .pipe(
        //                 map(snaps => snaps.map(snap => {
        //                     const data = snap.payload.doc.data();
        //                     delete data.$key;
        //                     return (<Team>{$key: snap.payload.doc.id, ...data})
        //                 })),
        //                 map(teams => this.serializer.deserialize<Team>(teams, [Team])),
        //                 shareReplay(),
        //             );
        //     })
        // );
    }

    protected getBaseUri(params?: any): string {
        return 'teams';
    }

    protected getClass(): any {
        return Team;
    }
}
