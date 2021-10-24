import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { LazyDataProviderService } from '../../core/data/lazy-data-provider.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'ilvl',
  pure: false
})
export class IlvlPipe implements PipeTransform, OnDestroy {
  private readonly ilvl$ = this.lazyData.getLazyData('ilvls');
  private currentId?: number;
  private currentValue?: number;
  private sub?: Subscription;

  constructor(private readonly lazyData: LazyDataProviderService, private readonly cd: ChangeDetectorRef) {
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  transform(id: number): number | undefined {
    if (id !== this.currentId) {
      this.currentId = id;
      this.sub?.unsubscribe();
      this.sub = this.ilvl$.pipe(map((i) => i[id])).subscribe(this.onIlvl);
    }
    return this.currentValue;
  }

  private readonly onIlvl = (val?: number) => {
    const didUpdate = val !== this.currentValue;
    this.currentValue = val;
    if (didUpdate) this.cd.markForCheck();
  };
}
