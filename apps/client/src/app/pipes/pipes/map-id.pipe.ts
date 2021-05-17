import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { Subject, of, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';

@Pipe({
  name: 'mapId',
  pure: false,
})
export class MapIdPipe implements PipeTransform, OnDestroy {
  private readonly placeId$ = new Subject<number | undefined>();
  private readonly mapId$ = this.placeId$.pipe(
    distinctUntilChanged(),
    switchMap((placeId) => (placeId >= 0 ? this.data.getPlace(placeId).en : of(undefined))),
    map((enName) => this.data.getMapId(enName))
  );
  private readonly sub: Subscription;
  private mapId?: number;

  constructor(private readonly data: LocalizedLazyDataService, private readonly cd: ChangeDetectorRef) {
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
    if (didUpdate) this.cd.detectChanges();
  };
}
