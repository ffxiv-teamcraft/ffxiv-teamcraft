import { Injectable, NgZone } from '@angular/core';
import { FirestoreStorage } from '../../../core/database/storage/firestore/firestore-storage';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { PendingChangesService } from '../../../core/database/pending-changes/pending-changes.service';
import { DbComment } from './model/db-comment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, orderBy, where, WithFieldValue } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbCommentsService extends FirestoreStorage<DbComment> {
  protected constructor(
    protected firestore: Firestore,
    protected serializer: NgSerializerService,
    protected zone: NgZone,
    protected pendingChangesService: PendingChangesService
  ) {
    super(firestore, serializer, zone, pendingChangesService);
  }

  public getComments(resourceId: string): Observable<DbComment[]> {
    return this.query(where('resourceId', '==', resourceId), orderBy('date', 'desc'))
      .pipe(
        map((comments) => {
          // Map comments array to a tree with replies etc
          return comments
            .sort((a, b) => {
              if (a.parent && a.parent === b.$key) {
                return 1;
              }
              if (b.parent && b.parent === a.$key) {
                return -1;
              }
              return b.date - a.date;
            })
            .reduce((tree, comment) => {
              if (!comment.parent || comment.parent === '0') {
                tree.push(comment);
              } else {
                const commentData = this.getCommentById(tree, comment.parent);
                if (commentData) {
                  commentData.replies.push(comment);
                }
              }
              return tree;
            }, []);
        })
      );
  }

  protected getBaseUri(): string {
    return 'db-comments';
  }

  protected getClass(): any {
    return DbComment;
  }

  private getCommentById(tree: DbComment[], key: string, occurences = 0): DbComment {
    const finding = tree.find((c) => c.$key === key);
    if (finding) {
      return finding;
    } else if (occurences < 10) {
      return this.getCommentById(
        [].concat.apply(
          [],
          tree.map((c) => c.replies)
        ),
        key,
        occurences + 1
      );
    }
    return null;
  }

  protected prepareData(data: Partial<WithFieldValue<DbComment>>): Partial<WithFieldValue<DbComment>> {
    const { replies, ...prepared } = data;
    return prepared;
  }
}
