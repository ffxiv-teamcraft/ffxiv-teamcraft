import 'reflect-metadata';
import { FirestoreStorage } from './firestore-storage';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../pending-changes/pending-changes.service';
import { METADATA_FOREIGN_KEY_REGISTRY } from '../../relational/foreign-key';
import { Class } from '@kaiu/serializer';
import { catchError, finalize, shareReplay, tap } from 'rxjs/operators';
import { DataModel } from '../data-model';
import { Observable, throwError } from 'rxjs';
import { Firestore, QueryConstraint, where } from '@angular/fire/firestore';

@Injectable()
export abstract class FirestoreRelationalStorage<T extends DataModel> extends FirestoreStorage<T> {

  private readonly modelInstance: T;

  private foreignKeyCache: { [index: string]: Observable<T[]> } = {};

  protected constructor(protected firestore: Firestore, protected serializer: NgSerializerService,
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

  public getShared(userId: string): Observable<T[]> {
    return this.query(where(`registry.${userId}`, '>=', 20))
      .pipe(
        catchError(error => {
          console.error(`GET SHARED ${this.getBaseUri()}:${userId}`);
          console.error(error);
          return throwError(error);
        }),
        tap(() => this.recordOperation('read'))
      );
  }

  public getByForeignKey(foreignEntityClass: Class, foreignKeyValue: string, additionalFilters: QueryConstraint[] = [], cacheSuffix = ''): Observable<T[]> {
    const classMetadataRegistry = Reflect.getMetadata(METADATA_FOREIGN_KEY_REGISTRY, this.modelInstance);
    const foreignPropertyEntry = classMetadataRegistry.find((entry) => entry.clazz === foreignEntityClass);
    if (foreignPropertyEntry === undefined) {
      throw new Error(`No foreign key in class ${this.getClass().name} for entity ${foreignEntityClass.name}`);
    }
    const foreignPropertyKey = foreignPropertyEntry.property;
    const cacheKey = foreignKeyValue + cacheSuffix;
    if (this.getBaseUri() === 'alarms') {
      console.log('GET');
    }
    if (this.foreignKeyCache[cacheKey] === undefined) {
      this.foreignKeyCache[cacheKey] = this.query(
        where(foreignPropertyKey, '==', foreignKeyValue),
        ...additionalFilters
      ).pipe(
        catchError(error => {
          console.error(`GET BY FOREIGN KEY ${this.getBaseUri()}:${foreignPropertyKey}=${foreignKeyValue}`);
          console.error(error);
          return throwError(error);
        }),
        tap((els) => {
          if (this.getBaseUri() === 'alarms') {
            console.log('NEW DATA', els);
          }
        }),
        tap(() => this.recordOperation('read')),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => delete this.foreignKeyCache[cacheKey])
      );
    }
    return this.foreignKeyCache[cacheKey];
  }
}
