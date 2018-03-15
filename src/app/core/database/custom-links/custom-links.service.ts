import {Injectable, NgZone} from '@angular/core';
import {FirebaseStorage} from '../storage/firebase/firebase-storage';
import {CustomLink} from './costum-link';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFireDatabase} from 'angularfire2/database';
import {DiffService} from '../diff/diff.service';

@Injectable()
export class CustomLinksService extends FirebaseStorage<CustomLink> {

    constructor(protected database: AngularFireDatabase,
                protected serializer: NgSerializerService,
                protected diffService: DiffService,
                protected zone: NgZone) {
        super(database, serializer, diffService, zone);
    }

    protected getBaseUri(): string {
        return 'custom_links';
    }

    protected getClass(): any {
        return CustomLink;
    }

}
