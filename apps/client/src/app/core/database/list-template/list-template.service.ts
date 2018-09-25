import { CustomLinksService } from '../custom-links/custom-links.service';
import { Injectable, NgZone } from '@angular/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { DiffService } from '../diff/diff.service';
import { Observable } from 'rxjs';
import { ListTemplate } from './list-template';
import { PendingChangesService } from '../pending-changes/pending-changes.service';
import { map } from 'rxjs/internal/operators';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class ListTemplateService extends CustomLinksService<ListTemplate> {

  constructor(protected database: AngularFireDatabase,
              protected serializer: NgSerializerService,
              protected diffService: DiffService,
              protected zone: NgZone,
              protected pendingChangesService: PendingChangesService) {
    super(database, serializer, pendingChangesService);
  }

  getByListId(listId: string): Observable<ListTemplate> {
    return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('originalListId').equalTo(listId))
      .snapshotChanges()
      .pipe(
        map((snaps: any[]) => snaps
          .map(snap => ({ $key: snap.payload.key, ...snap.payload.val() }))
          .map(l => this.serializer.deserialize<ListTemplate>(l, this.getClass()))
        ),
        map(res => res[0])
      );
  }

  protected getBaseUri(): string {
    return 'list_templates';
  }

  protected getClass(): any {
    return ListTemplate;
  }
}
