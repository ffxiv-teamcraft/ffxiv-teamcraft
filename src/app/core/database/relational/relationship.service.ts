import {FirestoreStorage} from '../storage/firebase/firestore-storage';
import {Relationship} from './relationship';
import {Observable} from 'rxjs/index';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {NgZone} from '@angular/core';
import {PendingChangesService} from '../pending-changes/pending-changes.service';
import {map} from 'rxjs/operators';

export abstract class RelationshipService<T extends Relationship<any, any>> extends FirestoreStorage<T> {

    protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                          protected pendingChangesService: PendingChangesService) {
        super(firestore, serializer, zone, pendingChangesService);
    }

    protected abstract getRelationCollection(): string;

    public getByFrom(from: string): Observable<Relationship<any, any>[]> {
        return this.firestore.collection(this.getBaseUri(), ref => ref.where('from', '==', from))
            .snapshotChanges()
            .pipe(
                map((snaps: any[]) => snaps.map(snap => ({$key: snap.payload.doc.id, ...snap.payload.doc.data()}))),
                map((lists: any[]) => this.serializer.deserialize<Relationship<any, any>>(lists, [Relationship]))
            );
    }

    public getByTo(to: string): Observable<Relationship<any, any>[]> {
        return this.firestore.collection(this.getBaseUri(), ref => ref.where('to', '==', to))
            .snapshotChanges()
            .pipe(
                map((snaps: any[]) => snaps.map(snap => ({$key: snap.payload.doc.id, ...snap.payload.doc.data()}))),
                map((lists: any[]) => this.serializer.deserialize<Relationship<any, any>>(lists, [Relationship]))
            );
    }

    public getBaseUri(): string {
        return `relationships/${this.getRelationCollection()}`
    }
}
