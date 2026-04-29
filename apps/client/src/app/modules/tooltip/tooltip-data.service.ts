import { Injectable, inject } from '@angular/core';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TooltipDataService {
  private lazyData = inject(LazyDataFacade);


  getItemTooltipData(id: number) {
    return combineLatest([
      this.lazyData.getRow('itemsDatabasePages', id),
      this.lazyData.getRow('extracts', id)
    ]).pipe(
      map(([db, extract]) => {
        return {
          ...db,
          ...extract
        };
      })
    );
  }

  getActionTooltipData(id: number) {
    return this.lazyData.getRow('actionsDatabasePages', id);
  }
}
