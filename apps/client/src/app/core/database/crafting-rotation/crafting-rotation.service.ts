import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { AngularFirestore, DocumentChangeAction, QueryFn } from '@angular/fire/firestore';
import { FirestoreRelationalStorage } from '../storage/firestore/firestore-relational-storage';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RotationTag } from '../../../pages/simulator/components/community-rotations-page/rotation-tag';
import { CommunityRotationFilters } from './community-rotation-filters';

@Injectable()
export class CraftingRotationService extends FirestoreRelationalStorage<CraftingRotation> {

  constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getCommunityRotations(filters: CommunityRotationFilters): Observable<CraftingRotation[]> {
    if (filters.tags.length === 0 && filters.name.length < 3 && filters.durability === null && filters.rlvl === null) {
      return of([]);
    }
    const query: QueryFn = ref => {
      let baseQuery = ref.where(`public`, '==', true);
      if (filters.tags.length > 0) {
        baseQuery = baseQuery.where('tags', 'array-contains', filters.tags[0]);
      }
      return baseQuery;
    };
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<CraftingRotation>[]) => {
          const lists = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: CraftingRotation = <CraftingRotation>{ $key: snap.payload.doc.id, ...snap.payload.doc.data() };
              delete snap.payload;
              return valueWithKey;
            })
            .filter(rotation => {
              return filters.tags.reduce((res, tag) => res && rotation.tags.indexOf(<RotationTag>tag) > -1, true);
            });
          return this.serializer.deserialize<CraftingRotation>(lists, [this.getClass()])
            .filter(rotation => {
              let matches = rotation.getName().toLowerCase().indexOf(filters.name.toLowerCase()) > -1;
              if (filters.durability) {
                matches = matches && rotation.recipe.durability === filters.durability;
              }
              return matches;
            });
        })
      );
  }

  protected getBaseUri(): string {
    return '/rotations';
  }

  protected getClass(): any {
    return CraftingRotation;
  }

}
