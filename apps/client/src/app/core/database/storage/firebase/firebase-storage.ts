import { DataModel } from '../data-model';
import { DataStore } from '../data-store';
import { from, Observable } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';


import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { debounceTime, map, shareReplay, tap } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/compat/database';

export abstract class FirebaseStorage<T extends DataModel> extends DataStore<T> {

  constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService,
              protected pendingChangesService: PendingChangesService) {
    super();
  }

  add(data: T): Observable<string> {
    delete data.$key;
    return from(this.firebase.list<T>(this.getBaseUri()).push(data))
      .pipe(
        map(pushResult => pushResult.key)
      );
  }

  get(uid: string): Observable<T> {
    return this.firebase.object(`${this.getBaseUri()}/${uid}`)
      .snapshotChanges()
      .pipe(
        map((snap: any) => {
          const valueWithKey: T = { $key: snap.payload.key, ...snap.payload.val() };
          if (!snap.payload.exists()) {
            throw new Error('Not found');
          }
          delete snap.payload;
          return this.serializer.deserialize<T>(valueWithKey, this.getClass());
        }),
        debounceTime(50),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  update(uid: string, data: T): Observable<void> {
    this.pendingChangesService.addPendingChange(`update ${this.getBaseUri()}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    delete data.$key;
    return from(this.firebase.object(`${this.getBaseUri()}/${uid}`).update(data))
      .pipe(
        tap(() => {
          this.pendingChangesService.removePendingChange(`update ${this.getBaseUri()}/${uid}`);
        })
      );
  }

  set(uid: string, data: T): Observable<void> {
    this.pendingChangesService.addPendingChange(`set ${this.getBaseUri()}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    delete data.$key;
    return from(this.firebase.object(`${this.getBaseUri()}/${uid}`).set(data))
      .pipe(tap(() => {
          this.pendingChangesService.removePendingChange(`set ${this.getBaseUri()}/${uid}`);
        })
      );
  }

  remove(uid: string): Observable<void> {
    this.pendingChangesService.addPendingChange(`remove ${this.getBaseUri()}/${uid}`);
    if (uid === undefined || uid === null || uid === '') {
      throw new Error('Empty uid');
    }
    return from(this.firebase.object(`${this.getBaseUri()}/${uid}`).remove())
      .pipe(
        tap(() => {
          this.pendingChangesService.removePendingChange(`remove ${this.getBaseUri()}/${uid}`);
        })
      );
  }

}
