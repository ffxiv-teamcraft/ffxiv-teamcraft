import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from './pending-changes/pending-changes.service';
import { FirestoreStorage } from './storage/firestore/firestore-storage';
import { BlogEntry } from '../../pages/blog/blog-entry';
import { Observable } from 'rxjs';
import { collectionData, Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class BlogService extends FirestoreStorage<BlogEntry> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getAll(): Observable<BlogEntry[]> {
    return collectionData(this.collection);
  }

  protected getBaseUri(): string {
    return '/blog';
  }

  protected getClass(): any {
    return BlogEntry;
  }

}
