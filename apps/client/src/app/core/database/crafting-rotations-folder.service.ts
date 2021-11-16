import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CraftingRotationsFolder } from '../../model/other/crafting-rotations-folder';

@Injectable()
export class CraftingRotationsFolderService extends FirestoreRelationalStorage<CraftingRotationsFolder> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getWithWriteAccess(userId: string): Observable<CraftingRotationsFolder[]> {
    return this.firestore.collection(this.getBaseUri(), ref => ref.where(`registry.${userId}`, '>=', 30))
      .snapshotChanges()
      .pipe(
        tap(() => this.recordOperation('read')),
        map((snaps: DocumentChangeAction<CraftingRotationsFolder>[]) => {
          const folders = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: CraftingRotationsFolder = <CraftingRotationsFolder>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<CraftingRotationsFolder>(folders, [this.getClass()]);
        })
      );
  }

  protected getBaseUri(): string {
    return '/crafting-rotations-folders';
  }

  protected getClass(): any {
    return CraftingRotationsFolder;
  }

}
