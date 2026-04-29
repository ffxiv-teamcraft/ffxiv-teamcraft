import { Injectable, NgZone, inject } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreRelationalStorage } from './storage/firestore/firestore-relational-storage';
import { Folder } from '../../model/folder/folder';
import { Class } from '@kaiu/serializer';
import { Observable } from 'rxjs';
import { FolderContentType } from '../../model/folder/folder-content-type';
import { Firestore, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FoldersService extends FirestoreRelationalStorage<Folder<any>> {
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

  public getByForeignKeyAndType<T>(foreignEntityClass: Class, foreignKeyValue: string, folderType: FolderContentType): Observable<Folder<T>[]> {
    return super.getByForeignKey(foreignEntityClass, foreignKeyValue, [where('contentType', '==', folderType)]);
  }

  protected getBaseUri(): string {
    return '/folders';
  }

  protected getClass(): any {
    return Folder;
  }

}
