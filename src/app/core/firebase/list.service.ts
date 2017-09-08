import {StoredDataService} from './stored-data.service';
import {List} from '../../model/list/list';
import {Injectable} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer/ng-serializer.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ListService extends StoredDataService<List> {

    constructor(protected firebase: AngularFireDatabase,
                protected serializer: NgSerializerService,
                private af: AngularFireAuth) {
        super(firebase, serializer);
    }

    public getRouterPath(uid: string): Observable<string[]> {
        return this.af.authState.map(state => ['list', state.uid, uid]);
    }

    getBaseUri(): Observable<string> {
        return this.af.authState.map(state => `/users/${state.uid}/lists`);
    }

    getClass(): any {
        return List;
    }

}
