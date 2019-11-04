import { merge, Observable, OperatorFunction } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';
import { List } from '../../modules/list/model/list';
import { ListRow } from '../../modules/list/model/list-row';

export function onlyWhenItemChanges(
  item$: Observable<ListRow>
): OperatorFunction<List, List> {
  return (source: Observable<List>) => {
    return item$.pipe(
      first(),
      switchMap(item => {
        return merge(
          source.pipe(first()),
          source.pipe(
            filter(list => {
              return list.modificationsHistory
                .filter(entry => Date.now() - entry.date < 1000)
                .some(entry => entry.itemId === item.id);
            })
          )
        );
      })
    );
  };
}
