import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { I18nName } from '../../model/common/i18n-name';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'actionName'
})
export class ActionNamePipe implements PipeTransform {
  constructor(private lazyData: LazyDataFacade) {
  }

  transform(id: number): Observable<I18nName> {
    return combineLatest([
      this.lazyData.getI18nName('actions', id),
      this.lazyData.getI18nName('craftActions', id)
    ]).pipe(
      map(([action, craftAction]) => {
        return action || craftAction;
      })
    );
  }
}
