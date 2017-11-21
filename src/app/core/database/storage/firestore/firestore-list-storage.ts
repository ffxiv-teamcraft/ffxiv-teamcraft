import {List} from '../../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {AngularFirestore} from 'angularfire2/firestore';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {Injectable} from '@angular/core';
import {FirestoreStorage} from './firestore-storage';

@Injectable()
export class FirestoreListStorage extends FirestoreStorage<List> {

    constructor(firestore: AngularFirestore, serializer: NgSerializerService) {
        super(firestore, serializer);
    }

    getBaseUri(params?: any): Observable<string> {
        return Observable.of('lists');
    }

    getClass(): any {
        return List;
    }
}
