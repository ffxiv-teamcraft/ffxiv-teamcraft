import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { Subject, of, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

@Pipe({
  name: 'statusIcon',
  pure: false,
})
export class StatusIconPipe implements PipeTransform, OnDestroy {
  private readonly statusId$ = new Subject<number | undefined>();
  private readonly statusIcon$ = this.statusId$.pipe(
    distinctUntilChanged(),
    switchMap((id) => (id ? this.l12n.getStatusIcon(id) : of(undefined)))
  );
  private readonly sub: Subscription;
  private statusIcon?: string;

  constructor(private readonly l12n: LocalizedLazyDataService, private readonly cd: ChangeDetectorRef) {
    this.sub = this.statusIcon$.subscribe(this.onStatusIcon);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  transform(id?: number): string | undefined {
    this.statusId$.next(id);
    return this.statusIcon;
  }

  private readonly onStatusIcon = (icon?: string) => {
    const didUpdate = this.statusIcon !== icon;
    this.statusIcon = icon;
    if (didUpdate) this.cd.detectChanges();
  };
}
