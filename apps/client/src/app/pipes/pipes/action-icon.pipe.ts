import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LazyDataProviderService } from '../../core/data/lazy-data-provider.service';

@Pipe({
  name: 'actionIcon',
  pure: false,
})
export class ActionIconPipe implements PipeTransform, OnDestroy {
  private static readonly DEFAULT = 'assets/icons/remove_final_appraisal.png';
  private readonly actionIcons$ = this.lazyData.getLazyData('actionIcons');
  private sub?: Subscription;
  private currentId?: number;
  private currentValue?: string;

  constructor(private readonly cd: ChangeDetectorRef, private lazyData: LazyDataProviderService) {}

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  transform(id: number, fallback?: string): string {
    if (isNil(id) || id === -1) {
      this.setCurrentValue(undefined);
    } else if (id !== this.currentId) {
      this.sub?.unsubscribe();
      this.sub = this.actionIcons$.pipe(map((i) => i[id])).subscribe(this.setCurrentValue);
      this.currentId = id;
    }
    return this.currentValue || fallback || ActionIconPipe.DEFAULT;
  }

  private setCurrentValue = (val?: string) => {
    const didUpdate = this.currentValue !== val;
    this.currentValue = val;
    if (didUpdate) this.cd.detectChanges();
  };
}
