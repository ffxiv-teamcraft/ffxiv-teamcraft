import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { BlogEntry } from '../../pages/blog/blog-entry';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BlogService extends FirestoreStorage<BlogEntry> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getAll(): Observable<BlogEntry[]> {
    return this.firestore.collection(this.getBaseUri())
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<BlogEntry>[]) => {
          const posts = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: BlogEntry = <BlogEntry>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<BlogEntry>(posts, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(): string {
    return '/blog';
  }

  protected getClass(): any {
    return BlogEntry;
  }

}
