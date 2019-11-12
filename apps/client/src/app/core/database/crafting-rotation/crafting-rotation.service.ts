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
    if (filters.tags.length === 0
      && filters.name.length < 3
      && filters.durability === null
      && filters.rlvl === null
      && filters.craftsmanship === null
      && filters.control === null
      && filters.cp === null
    ) {
      return of([]);
    }
    const query: QueryFn = ref => {
      return ref.where(`public`, '==', true);
    };
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<CraftingRotation>[]) => {
          const rotations = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: CraftingRotation = <CraftingRotation>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            })
            .filter(rotation => {
              return filters.tags.reduce((res, tag) => res && rotation.tags.indexOf(<RotationTag>tag) > -1, true);
            });
          return this.serializer.deserialize<CraftingRotation>(rotations, [this.getClass()])
            .filter(rotation => {
              let matches = rotation.getName().toLowerCase().indexOf(filters.name.toLowerCase()) > -1;
              if (filters.tags.length > 0) {
                matches = matches && filters.tags.reduce((res, tag) => {
                  return res && rotation.tags.indexOf(tag) > -1;
                }, true);
              }
              if (filters.durability) {
                matches = matches && rotation.community.durability === filters.durability;
              }
              if (filters.rlvl) {
                if ([150, 290, 420].indexOf(filters.rlvl) > -1) {
                  matches = matches && rotation.community.rlvl >= filters.rlvl - 30 && rotation.community.rlvl <= filters.rlvl;
                } else {
                  matches = matches && rotation.community.rlvl === filters.rlvl;
                }
              }
              if (filters.craftsmanship) {
                matches = matches && rotation.community.minCraftsmanship <= filters.craftsmanship;
              }
              if (filters.control) {
                matches = matches && rotation.community.minControl <= filters.control;
              }
              if (filters.cp) {
                matches = matches && rotation.community.minCp <= filters.cp;
              }
              return matches;
            });
        })
      );
  }

  public getUserCommunityRotations(userId: string): Observable<CraftingRotation[]> {
    const query: QueryFn = ref => {
      return ref.where(`public`, '==', true).where('authorId', '==', userId);
    };
    return this.firestore.collection(this.getBaseUri(), query)
      .snapshotChanges()
      .pipe(
        map((snaps: DocumentChangeAction<CraftingRotation>[]) => {
          const rotations = snaps
            .map((snap: DocumentChangeAction<any>) => {
              const valueWithKey: CraftingRotation = <CraftingRotation>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
              delete snap.payload;
              return valueWithKey;
            });
          return this.serializer.deserialize<CraftingRotation>(rotations, [this.getClass()]);
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
