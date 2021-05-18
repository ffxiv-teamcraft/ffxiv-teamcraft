import { ChangeDetectorRef, Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nLazy } from '../../model/common/i18n-name-lazy';
import { Fate } from '../../pages/db/model/fate/fate';

@Pipe({
  name: 'fate',
  pure: false,
})
export class FatePipe implements PipeTransform, OnDestroy {
  private currentId?: number;
  private currentValue?: I18nLazy<Fate>;
  private sub?: Subscription;

  constructor(private readonly l12n: LocalizedLazyDataService, private readonly cd: ChangeDetectorRef) {}

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  transform(id: number): I18nLazy<Fate> | undefined {
    if (id !== this.currentId) {
      this.currentId = id;
      this.sub?.unsubscribe();
      this.sub = this.l12n.getFate(id).subscribe(this.onFate);
    }
    return this.currentValue;
  }

  private readonly onFate = (fate?: I18nLazy<Fate>) => {
    const didUpdate = fate !== this.currentValue;
    this.currentValue = fate;
    if (didUpdate) this.cd.detectChanges();
  };
}
