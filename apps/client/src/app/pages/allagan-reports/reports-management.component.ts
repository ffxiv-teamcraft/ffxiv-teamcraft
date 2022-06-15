import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { TeamcraftComponent } from '../../core/component/teamcraft-component';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { map, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  template: ''
})
export class ReportsManagementComponent extends TeamcraftComponent {

  protected readonly items$ = this.lazyData.getSearchIndex('items');

  protected readonly instances$ = combineLatest([
    this.lazyData.getSearchIndex('instances'),
    this.lazyData.getEntry('maps').pipe(
      switchMap(maps => {
        return combineLatest(Object.keys(maps).map(key => {
          return this.lazyData.getI18nName('places', maps[key].placename_id).pipe(
            map(placeName => {
              return {
                id: -key,
                name: placeName
              };
            })
          );
        }));
      })
    )
  ]).pipe(
    map(entries => entries.flat()),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly fates$ = this.lazyData.getSearchIndex('fates', 'name');

  protected readonly ventures$ = this.lazyData.getSearchIndex('ventures');

  protected readonly submarineVoyages$ = this.lazyData.getSearchIndex('submarineVoyages');

  protected readonly airshipVoyages$ = this.lazyData.getSearchIndex('airshipVoyages');

  protected readonly mobs$ = this.lazyData.getSearchIndex('mobs');

  constructor(protected lazyData: LazyDataFacade) {
    super();
  }
}
