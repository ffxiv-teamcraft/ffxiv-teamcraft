import {Injectable, NgZone} from '@angular/core';
import {FirestoreStorage} from '../storage/firebase/firestore-storage';
import {Commission} from '../../../model/commission/commission';
import {PendingChangesService} from '../pending-changes/pending-changes.service';
import {AngularFirestore, QueryFn} from 'angularfire2/firestore';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {Observable} from 'rxjs/index';
import {map, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CommissionService extends FirestoreStorage<Commission> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService) {
        super(firestore, serializer, zone, pendingChangesService);
    }


    public add(data: Commission): Observable<string> {
        return super.add(data, data.server).pipe(tap(() => this.clearCache()));
    }

    public get(uid: string, server: string): Observable<Commission> {
        return super.get(uid, server);
    }

    public update(uid: string, data: Commission): Observable<void> {
        return super.update(uid, data, data.server);
    }

    public set(uid: string, data: Commission): Observable<void> {
        return super.set(uid, data, data.server);
    }

    public remove(uid: string, server: string): Observable<void> {
        return super.remove(uid, server);
    }

    public getAll(server: string, query?: QueryFn): Observable<Commission[]> {
        return this.firestore.collection(this.getBaseUri(server), query)
            .snapshotChanges()
            .pipe(
                map((snaps: any[]) => snaps.map(snap => ({$key: snap.payload.doc.id, ...snap.payload.doc.data()}))),
                map((commissions: any[]) => this.serializer.deserialize<Commission>(commissions, [Commission])),
                map((commissions: Commission[]) => commissions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            );
    }

    protected getBaseUri(server: string): string {
        return `commissions/${server}/registry`;
    }

    protected getClass(): any {
        return Commission;
    }
}
