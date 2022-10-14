import { Injectable, NgZone } from '@angular/core';
import { CustomLink } from './custom-link';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { Observable } from 'rxjs';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { first, map, tap } from 'rxjs/operators';
import { FirestoreRelationalStorage } from '../storage/firestore/firestore-relational-storage';
import { Firestore, where } from '@angular/fire/firestore';


@Injectable()
export class CustomLinksService<T extends CustomLink = CustomLink> extends FirestoreRelationalStorage<T> {

  constructor(protected firestore: Firestore, protected serializer: NgSerializerService, protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getByUriAndNickname(uri: string, nickName: string): Observable<T> {
    return this.query(where('uri', '==', uri))
      .pipe(
        tap(() => this.recordOperation('read')),
        first(),
        map((res: T[]) => res.filter(link => link.authorNickname === nickName)),
        map(res => res[0])
      );
  }

  protected getBaseUri(): string {
    return '/custom-links';
  }

  protected getClass(): any {
    return CustomLink;
  }

}
