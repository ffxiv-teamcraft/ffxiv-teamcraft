import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../core/data/localized-data.service';
import { I18nName } from '../model/common/i18n-name';
import { CustomItem } from '../modules/custom-items/model/custom-item';
import { Observable } from 'rxjs';
import { CustomItemsFacade } from '../modules/custom-items/+state/custom-items.facade';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'customItemName',
  pure: true
})
export class CustomItemNamePipe implements PipeTransform {

  constructor(private facade: CustomItemsFacade) {
  }

  transform(key: string): Observable<string> {
    return this.facade.allCustomItems$.pipe(
      map(items => {
        const found = items.find(item => item.$key === key);
        if (!found) {
          return key;
        }
        return found.name;
      })
    );
  }

}
