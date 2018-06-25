import {Injectable, NgZone} from '@angular/core';
import {FirestoreStorage} from '../storage/firebase/firestore-storage';
import {Commission} from '../../../model/commission/commission';
import {PendingChangesService} from '../pending-changes/pending-changes.service';
import {AngularFirestore} from 'angularfire2/firestore';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {Observable} from 'rxjs/index';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CommissionService extends FirestoreStorage<Commission> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService) {
        super(firestore, serializer, zone, pendingChangesService);
    }

    public getAll(server: string): Observable<Commission[]> {
        return this.firestore.collection(this.getBaseUri(), ref => ref.where('server', '==', server))
            .snapshotChanges()
            .pipe(
                map((snaps: any[]) => snaps.map(snap => ({$key: snap.payload.doc.id, ...snap.payload.doc.data()}))),
                map((commissions: any[]) => this.serializer.deserialize<Commission>(commissions, [Commission])),
                map((commissions: Commission[]) => commissions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            );
    }

    protected getBaseUri(): string {
        return 'commissions';
    }

    protected getClass(): any {
        return Commission;
    }
}
