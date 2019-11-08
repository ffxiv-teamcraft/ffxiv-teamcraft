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
              const lastModifications = list.modificationsHistory.filter(entry => {
                return Date.now() - entry.date < 600000;
              });
              if (lastModifications.length === 0) {
                return true;
              }
              return lastModifications.some(entry => {
                return entry.itemId === item.id || (item.requires || []).some(req => req.id === entry.itemId);
              });
            })
          )
        );
      })
    );
  };
}
