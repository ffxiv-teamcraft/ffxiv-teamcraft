import { Injectable, NgZone, inject } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CraftingRotationsFolder } from '../../model/other/crafting-rotations-folder';
import { Firestore, where } from '@angular/fire/firestore';

@Injectable()
export class CraftingRotationsFolderService extends FirestoreRelationalStorage<CraftingRotationsFolder> {
  protected firestore: Firestore;
  protected serializer: NgSerializerService;
  protected zone: NgZone;
  protected pendingChangesService: PendingChangesService;


  constructor() {
    const firestore = inject(Firestore);
    const serializer = inject(NgSerializerService);
    const zone = inject(NgZone);
    const pendingChangesService = inject(PendingChangesService);

    super(firestore, serializer, zone, pendingChangesService);
  
    this.firestore = firestore;
    this.serializer = serializer;
    this.zone = zone;
    this.pendingChangesService = pendingChangesService;
  }

  public getWithWriteAccess(userId: string): Observable<CraftingRotationsFolder[]> {
    return this.query(where(`registry.${userId}`, '>=', 30))
      .pipe(
        tap(() => this.recordOperation('read'))
      );
  }

  protected getBaseUri(): string {
    return '/crafting-rotations-folders';
  }

  protected getClass(): any {
    return CraftingRotationsFolder;
  }

}
