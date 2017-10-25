import {StoredDataService} from './stored-data.service';
import {List} from '../../model/list/list';
import {Injectable} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ListService extends StoredDataService<List> {

    private uuid: string;


    constructor(protected firebase: AngularFireDatabase,
                protected serializer: NgSerializerService,
                private af: AngularFireAuth) {
        super(firebase, serializer);
        this.af.authState.subscribe(state => this.uuid = state.uid);
    }

    /**
     * Gets the router path for a given list-details (useful to share lists)
     * @param uid The uid of the list-details
     * @returns {Observable<R>}
     */
    public getRouterPath(uid: string): Observable<string[]> {
        return this.af.authState.map(state => {
            return ['list', state.uid, uid];
        });
    }

    /**
     * Gets the firebase uri for a given list
     * @param uid The uid of the list-details
     * @returns {Observable<R>}
     */
    public getUri(uid: string): Observable<string> {
        return this.af.authState.map(state => {
            return `/users/${state.uid}/lists/${uid}`;
        });
    }

    /**
     * Gets an external list-details (one that doesn't belong to the current user)
     *
     * @param uuid The user uid
     * @param uid The list-details uid
     */
    public getUserList(uuid: string, uid: string): Observable<List> {
        return this.firebase.object(`/users/${uuid}/lists/${uid}`).map(list => {
            const res = this.serializer.deserialize<List>(list, List);
            res.$key = uid;
            return res;
        });
    }

    getBaseUri(params?: any): Observable<string> {
        if (params !== undefined) {
            return Observable.of(`/users/${params.uuid}/lists`);
        }
        return this.af.authState.map(user => {
            return `/users/${user.uid}/lists`;
        });
    }

    getClass(): any {
        return List;
    }

}
