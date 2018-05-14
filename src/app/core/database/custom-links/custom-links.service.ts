import {Injectable, NgZone} from '@angular/core';
import {FirebaseStorage} from '../storage/firebase/firebase-storage';
import {CustomLink} from './costum-link';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFireDatabase} from 'angularfire2/database';
import {DiffService} from '../diff/diff.service';
import {Observable} from 'rxjs';
import {PendingChangesService} from '../pending-changes/pending-changes.service';
import {first, map} from 'rxjs/operators';


@Injectable()
export class CustomLinksService<T extends CustomLink = CustomLink> extends FirebaseStorage<T> {

    constructor(protected database: AngularFireDatabase,
                protected serializer: NgSerializerService,
                protected diffService: DiffService,
                protected zone: NgZone,
                protected pendingChangesService: PendingChangesService) {
        super(database, serializer, diffService, zone, pendingChangesService);
    }

    public getAllByAuthor(userKey: string): Observable<T[]> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('author').equalTo(userKey))
            .snapshotChanges()
            .map(snaps => snaps
                .map(snap => ({$key: snap.payload.key, ...snap.payload.val()}))
                .map(l => this.serializer.deserialize<T>(l, this.getClass()))
            );
    }

    public getByUriAndNickname(uri: string, nickName: string): Observable<T> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('uri').equalTo(uri))
            .snapshotChanges()
            .pipe(
                first(),
                map(snaps => snaps
                    .map(snap => ({$key: snap.payload.key, ...snap.payload.val()}))
                    .map(l => this.serializer.deserialize<T>(l, this.getClass()))
                ),
                map(res => res.filter(link => link.authorNickname === nickName)),
                map(res => res[0])
            );
    }

    protected getBaseUri(): string {
        return 'custom_links';
    }

    protected getClass(): any {
        return CustomLink;
    }

}
