import { IntegrityCheck } from './integrity-check';
import { Observable } from 'rxjs';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { map } from 'rxjs/operators';
import { FirestoreListStorage } from '../../../../core/database/storage/list/firestore-list-storage';

export class AllListsOkCheck implements IntegrityCheck<string[]> {

  constructor(private listsService: FirestoreListStorage) {
  }

  getNameKey(): string {
    return 'All_lists_ok';
  }

  check(user: TeamcraftUser): Observable<string[] | null> {
    return this.listsService.getByForeignKeyRaw(TeamcraftUser, user.$key)
      .pipe(
        map(lists => {
          return lists.filter(list => !list.name).map(list => list.$key);
        }),
        map(lists => {
          if (lists.length === 0) {
            return null;
          }
          return lists;
        })
      );
  }

  fix(user: TeamcraftUser, result: string[]): TeamcraftUser {
    result.forEach(listId => {
      this.listsService.remove(listId);
    });
    return user;
  }

}
