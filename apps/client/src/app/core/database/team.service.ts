import { Injectable, NgZone } from '@angular/core';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { Team } from '../../model/team/team';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Firestore, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends FirestoreStorage<Team> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getUserTeams(userId: string): Observable<Team[]> {
    return this.query(where('members', 'array-contains', userId))
      .pipe(
        tap(() => this.recordOperation('read', `userId:${userId}`))
      );
  }

  protected getBaseUri(): string {
    return 'teams';
  }

  protected getClass(): any {
    return Team;
  }
}
