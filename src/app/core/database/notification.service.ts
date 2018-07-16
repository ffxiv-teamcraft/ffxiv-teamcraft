import {RelationshipService} from './relational/relationship.service';
import {NotificationRelationship} from '../notification/notification-relationship';
import {Injectable, NgZone} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {PendingChangesService} from './pending-changes/pending-changes.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends RelationshipService<NotificationRelationship> {

    protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                          protected pendingChangesService: PendingChangesService) {
        super(firestore, serializer, zone, pendingChangesService);
    }

    protected getRelationCollection(): string {
        return 'notifications';
    }

    protected getClass(): any {
        return NotificationRelationship;
    }

}
