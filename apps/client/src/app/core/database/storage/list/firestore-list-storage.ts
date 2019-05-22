import { List } from '../../../../modules/list/model/list';
import { Injectable, NgZone } from '@angular/core';
import { ListStore } from './list-store';
import { combineLatest, Observable } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreStorage } from '../firestore/firestore-storage';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FirestoreListStorage extends FirestoreStorage<List> implements ListStore {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  getPublicLists(): Observable<List[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where('public', '==', true))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => snaps.map(snap => ({ $key: snap.payload.doc.id, ...snap.payload.doc.data() }))),
        map((lists: any[]) => this.serializer.deserialize<List>(lists, [List])),
        map((lists: List[]) => lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
        first()
      );
  }

  getPublicListsByAuthor(uid: string): Observable<List[]> {
    return this.listsByAuthorRef(uid).pipe(map(lists => lists.filter(list => list.public === true)));
  }

  byAuthor(uid: string): Observable<List[]> {
    return this.listsByAuthorRef(uid);
  }

  deleteByAuthor(uid: string): Observable<void> {
    return this.listsByAuthorRef(uid)
      .pipe(
        first(),
        map(lists => lists.map(list => list.$key)),
        switchMap(listIds => {
          const deletion = listIds.map(id => {
            return this.remove(id);
          });
          return combineLatest(deletion).pipe(map(() => null));
        })
      );
  }

  protected getBaseUri(): string {
    return 'lists';
  }

  protected getClass(): any {
    return List;
  }

  private listsByAuthorRef(uid: string): Observable<List[]> {
    return this.firestore
      .collection(this.getBaseUri(), ref => ref.where('authorId', '==', uid).orderBy('createdAt', 'desc'))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => snaps.map(snap => {
          // Issue #227 showed that sometimes, $key gets persisted (probably because of a migration process),
          // Because of that, we have to delete $key property from data snapshot, else the $key won't point to the correct list,
          // Resulting on an unreadable, undeletable list.
          const data = snap.payload.doc.data();
          delete data.$key;
          return (<List>{ $key: snap.payload.doc.id, ...data });
        })),
        map((lists: List[]) => this.serializer.deserialize<List>(lists, [List]))
      );
  }
}
