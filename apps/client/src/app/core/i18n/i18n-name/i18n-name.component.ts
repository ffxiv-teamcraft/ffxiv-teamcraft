import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, ReplaySubject } from 'rxjs';
import { LazyDataI18nKey } from '../../../lazy-data/lazy-data-types';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-i18n-name',
  templateUrl: './i18n-name.component.html',
  styleUrls: ['./i18n-name.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class I18nNameComponent {

  private content$ = new ReplaySubject<LazyDataI18nKey>();
  private id$ = new ReplaySubject<number>();

  public i18nName$ = combineLatest([this.content$, this.id$]).pipe(
    switchMap(([content, id]) => {
      return this.lazyData.getI18nName(content, id);
    })
  );

  @Input()
  set content(content: LazyDataI18nKey) {
    this.content$.next(content);
  }

  @Input()
  set id(id: number) {
    this.id$.next(id);
  }

  constructor(private lazyData: LazyDataFacade) {
  }

}
