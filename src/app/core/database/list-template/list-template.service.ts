import {CustomLinksService} from '../custom-links/custom-links.service';
import {Injectable, NgZone} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DiffService} from '../diff/diff.service';
import {Observable} from 'rxjs/Observable';
import {ListTemplate} from './list-template';

@Injectable()
export class ListTemplateService extends CustomLinksService<ListTemplate> {

    constructor(protected database: AngularFireDatabase,
                protected serializer: NgSerializerService,
                protected diffService: DiffService,
                protected zone: NgZone) {
        super(database, serializer, diffService, zone);
    }

    getByListId(listId: string): Observable<ListTemplate> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('originalListId').equalTo(listId))
            .snapshotChanges()
            .map(snaps => snaps
                .map(snap => ({$key: snap.payload.key, ...snap.payload.val()}))
                .map(l => this.serializer.deserialize<ListTemplate>(l, this.getClass()))
            )
            .map(res => res[0]);
    }

    protected getBaseUri(): string {
        return 'list_templates';
    }

    protected getClass(): any {
        return ListTemplate;
    }
}
