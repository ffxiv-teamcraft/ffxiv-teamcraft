import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Pipe({
  name: 'lazyIcon',
  pure: false
})
export class LazyIconPipe implements PipeTransform, OnDestroy {
  private readonly itemId$ = new Subject<number | undefined>();
  private readonly itemIcon$ = this.itemId$.pipe(
    distinctUntilChanged((idA, idB) => idA === idB),
    switchMap(itemId => {
      return this.lazyData.getRow('itemIcons', itemId).pipe(
        map(icon => [itemId, icon])
      );
    }),
    map(([itemId, itemIcon]) => {
      if (!itemIcon && itemId?.toString().indexOf('draft') > -1) {
        return `https://garlandtools.org/files/icons/item/custom/draft.png`;
      } else if (!itemIcon) {
        return 'https://xivapi.com/img-misc/code-regular.svg';
      } else {
        return `https://xivapi.com${itemIcon}`;
      }
    })
  );
  private readonly sub: Subscription;
  private iconUrl?: string;

  constructor(private readonly lazyData: LazyDataFacade, private readonly cd: ChangeDetectorRef) {
    this.sub = this.itemIcon$.subscribe(this.setIconUrl);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  transform(id: number): string | undefined {
    this.itemId$.next(id);
    return this.iconUrl;
  }

  private readonly setIconUrl = (url?: string) => {
    const didUpdate = this.iconUrl !== url;
    this.iconUrl = url;
    if (didUpdate) this.cd.markForCheck();
  };
}
