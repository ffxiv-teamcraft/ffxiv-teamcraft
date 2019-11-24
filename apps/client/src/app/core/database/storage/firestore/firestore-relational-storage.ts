import 'reflect-metadata';
import { FirestoreStorage } from './firestore-storage';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { METADATA_FOREIGN_KEY_REGISTRY } from '../../relational/foreign-key';
import { Class } from '@kaiu/serializer';
import { map, tap } from 'rxjs/operators';
import { DataModel } from '../data-model';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable()
export abstract class FirestoreRelationalStorage<T extends DataModel> extends FirestoreStorage<T> {

  private readonly modelInstance: T;

  private foreignKeyCache: { [index: string]: Observable<T[]> } = {};

  protected constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService,
                        protected zone: NgZone, protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
    const modelClass = this.getClass();
    this.modelInstance = new modelClass();
  }

  public stopListening(key: string, cacheEntry?: string): void {
    super.stopListening(key, cacheEntry);
    if (cacheEntry) {
      delete this.foreignKeyCache[cacheEntry];
    }
  }

  public getByForeignKey(foreignEntityClass: Class, foreignKeyValue: string, uriParams?: any): Observable<T[]> {
    const classMetadataRegistry = Reflect.getMetadata(METADATA_FOREIGN_KEY_REGISTRY, this.modelInstance);
    const foreignPropertyEntry = classMetadataRegistry.find((entry) => entry.clazz === foreignEntityClass);
    if (foreignPropertyEntry === undefined) {
      throw new Error(`No foreign key in class ${this.getClass().name} for entity ${foreignEntityClass.name}`);
    }
    const foreignPropertyKey = foreignPropertyEntry.property;
    if (this.foreignKeyCache[foreignKeyValue] === undefined) {
      this.foreignKeyCache[foreignKeyValue] = this.firestore.collection(this.getBaseUri(uriParams), ref => ref.where(foreignPropertyKey, '==', foreignKeyValue))
        .snapshotChanges()
        .pipe(
          map((snaps: DocumentChangeAction<T>[]) => {
            const rotations = snaps
              .map((snap: DocumentChangeAction<any>) => {
                const valueWithKey: T = <T>{ ...snap.payload.doc.data(), $key: snap.payload.doc.id };
                delete snap.payload;
                return valueWithKey;
              });
            return this.serializer.deserialize<T>(rotations, [this.getClass()]);
          }),
          map(elements => {
            return elements.map(el => {
              if ((el as any).afterDeserialized) {
                (el as any).afterDeserialized();
              }
              return el;
            });
          }),
          tap(elements => {
            elements.forEach(el => {
              this.syncCache[el.$key] = JSON.parse(JSON.stringify(el));
            });
          })
        );
    }
    return this.foreignKeyCache[foreignKeyValue];
  }
}
