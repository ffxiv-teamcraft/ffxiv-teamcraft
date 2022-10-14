import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { TeamInvite } from '../../model/team/team-invite';
import { Firestore } from '@angular/fire/firestore';

@Injectable()
export class TeamInviteService extends FirestoreRelationalStorage<TeamInvite> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  protected getBaseUri(): string {
    return '/team-invites';
  }

  protected getClass(): any {
    return TeamInvite;
  }

}
