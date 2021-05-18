import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';

@Pipe({
  name: 'questIcon',
  pure: false,
})
export class QuestIconPipe implements PipeTransform, OnDestroy {
  private readonly questId$ = new Subject<number | undefined>();
  private readonly questIcon$ = this.questId$.pipe(
    distinctUntilChanged(),
    switchMap((id) => (id >= 0 ? this.l12n.getQuest(id) : of(undefined))),
    map((quest) => quest?.icon)
  );
  private readonly sub: Subscription;
  private questIcon?: string;

  constructor(private readonly l12n: LocalizedLazyDataService, private readonly cd: ChangeDetectorRef) {
    this.sub = this.questIcon$.subscribe(this.onQuestIcon);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  transform(id: number): string | undefined {
    this.questId$.next(id);
    return this.questIcon;
  }

  private readonly onQuestIcon = (icon?: string) => {
    const didUpdate = this.questIcon !== icon;
    this.questIcon = icon;
    if (didUpdate) this.cd.detectChanges();
  };
}
