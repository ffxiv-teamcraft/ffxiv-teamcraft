import {Injectable, NgZone} from '@angular/core';
import {FirestoreStorage} from './storage/firebase/firestore-storage';
import {Workshop} from '../../model/other/workshop';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs/Observable';
import {DocumentChangeAction} from 'angularfire2/firestore/interfaces';

@Injectable()
export class WorkshopService extends FirestoreStorage<Workshop> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone) {
        super(firestore, serializer, zone);
    }

    getUserWorkshops(uid: string): Observable<Workshop[]> {
        return this.firestore.collection(this.getBaseUri(), ref => ref.where('authorId', '==', uid))
            .snapshotChanges()
            .map((snaps: DocumentChangeAction[]) => {
                const workshops = snaps.map(snap => {
                    const valueWithKey: Workshop = <Workshop>{$key: snap.payload.doc.id, ...snap.payload.doc.data()};
                    delete snap.payload;
                    return valueWithKey;
                });
                return this.serializer.deserialize<Workshop>(workshops, [this.getClass()]);
            })
            .debounceTime(50)
            .publishReplay(1)
            .refCount()
    }

    protected getBaseUri(): string {
        return '/workshops';
    }

    protected getClass(): any {
        return Workshop;
    }

}
