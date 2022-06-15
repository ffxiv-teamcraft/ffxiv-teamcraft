import { Injectable, NgZone } from '@angular/core';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { Team } from '../../model/team/team';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends FirestoreStorage<Team> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getUserTeams(userId: string): Observable<Team[]> {
    return this.firestore
      .collection(this.getBaseUri(), ref => ref.where('members', 'array-contains', userId))
      .snapshotChanges()
      .pipe(
        tap(() => this.recordOperation('read', `userId:${userId}`)),
        map(snaps => snaps.map(snap => {
          const data: Team = <Team>snap.payload.doc.data();
          delete data.$key;
          return (<Team>{ $key: snap.payload.doc.id, ...data });
        })),
        map(teams => this.serializer.deserialize<Team>(teams, [Team])),
        map(teams => {
          teams.forEach(team => team.afterDeserialized());
          return teams;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  protected getBaseUri(params?: any): string {
    return 'teams';
  }

  protected getClass(): any {
    return Team;
  }
}
