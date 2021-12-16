import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Pipe({
  name: 'mapId',
  pure: false
})
export class MapIdPipe implements PipeTransform, OnDestroy {
  private readonly placeId$ = new Subject<number | undefined>();

  private readonly mapId$ = this.placeId$.pipe(
    distinctUntilChanged(),
    switchMap((placeId) => (placeId >= 0 ? this.lazyData.getI18nName('places', placeId).pipe(map(name => name.en)) : of(undefined))),
    map((enName) => this.lazyData.getMapId(enName))
  );

  private readonly sub: Subscription;

  private mapId?: number;

  constructor(private readonly lazyData: LazyDataFacade, private readonly cd: ChangeDetectorRef) {
    this.sub = this.mapId$.subscribe(this.setMapId);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  transform(id: number): number | undefined {
    this.placeId$.next(id);
    return this.mapId;
  }

  private readonly setMapId = (mapId?: number) => {
    const didUpdate = this.mapId !== mapId;
    this.mapId = mapId;
    if (didUpdate) this.cd.markForCheck();
  };
}
