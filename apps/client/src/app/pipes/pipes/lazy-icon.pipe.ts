import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { Subject, combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

@Pipe({
  name: 'lazyIcon',
  pure: false
})
export class LazyIconPipe implements PipeTransform, OnDestroy {
  private readonly itemId$ = new Subject<number | undefined>();
  private readonly itemIcon$ = combineLatest([this.itemId$, this.lazyData.itemIcons$]).pipe(
    distinctUntilChanged(([idA], [idB]) => idA === idB),
    map(([itemId, itemIcons]) => {
      if (!itemIcons[itemId] && itemId?.toString().indexOf('draft') > -1) {
        return `https://garlandtools.org/files/icons/item/custom/draft.png`;
      } else if (!itemIcons[itemId]) {
        return 'https://xivapi.com/img-misc/code-regular.svg';
      } else {
        return `https://xivapi.com${itemIcons[itemId]}`;
      }
    })
  );
  private readonly sub: Subscription;
  private iconUrl?: string;

  constructor(private readonly lazyData: LazyDataService, private readonly cd: ChangeDetectorRef) {
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
    if (didUpdate) this.cd.detectChanges();
  };
}
