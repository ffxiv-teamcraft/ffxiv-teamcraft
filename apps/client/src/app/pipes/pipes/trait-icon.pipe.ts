import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';

@Pipe({
  name: 'traitIcon',
  pure: false,
})
export class TraitIconPipe implements PipeTransform, OnDestroy {
  private readonly traitId$ = new Subject<number | undefined>();
  private readonly traitIcon$ = this.traitId$.pipe(
    distinctUntilChanged(),
    switchMap((id) => (id ? this.l12n.getTraitIcon(id) : of(undefined)))
  );
  private readonly sub: Subscription;
  private traitIcon?: string;

  constructor(private readonly l12n: LocalizedLazyDataService, private readonly cd: ChangeDetectorRef) {
    this.sub = this.traitIcon$.subscribe(this.onTraitIcon);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  transform(id?: number): string | undefined {
    this.traitId$.next(id);
    return this.traitIcon;
  }

  private readonly onTraitIcon = (icon?: string) => {
    const didUpdate = this.traitIcon !== icon;
    this.traitIcon = icon;
    if (didUpdate) this.cd.detectChanges();
  };
}
