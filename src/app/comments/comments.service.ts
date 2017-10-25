import {Injectable} from '@angular/core';
import {StoredDataService} from '../core/firebase/stored-data.service';
import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFireDatabase} from 'angularfire2/database';
import {ResourceComment} from './resource-comment';

@Injectable()
export class CommentsService extends StoredDataService<ResourceComment> {


    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService) {
        super(firebase, serializer);
    }

    protected getBaseUri(resourceUri?: any): Observable<string> {
        return Observable.of(`${resourceUri}/comments`);
    }

    protected getClass() {
        return ResourceComment;
    }

}
