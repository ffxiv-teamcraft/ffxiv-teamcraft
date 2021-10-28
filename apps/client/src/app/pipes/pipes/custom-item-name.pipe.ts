import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomItemsFacade } from '../../modules/custom-items/+state/custom-items.facade';
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
      map((items) => {
        const found = items.find((item) => item !== undefined && item.$key === key);
        if (!found) {
          return key;
        }
        return found.name;
      })
    );
  }
}
