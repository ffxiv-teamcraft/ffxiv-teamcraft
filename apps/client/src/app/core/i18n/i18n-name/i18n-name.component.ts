import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest } from 'rxjs';
import { I18nName, LazyDataEntries, LazyDataI18nKey } from '@ffxiv-teamcraft/types';
import { filter, map, switchMap } from 'rxjs/operators';
import { observeInput } from '../../rxjs/observe-input';
import { I18nToolsService } from '../../tools/i18n-tools.service';
import { I18nPipe } from '../../i18n.pipe';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-i18n-name',
    templateUrl: './i18n-name.component.html',
    styleUrls: ['./i18n-name.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzSkeletonModule, I18nPipe]
})
export class I18nNameComponent {

  public i18nName$ = combineLatest([
    observeInput(this, 'content'),
    observeInput(this, 'id'),
    observeInput(this, 'fallback', true),
    observeInput(this, 'field', true)
  ]).pipe(
    filter(([, id]) => id !== null),
    switchMap(([content, id, fallback, field]) => {
      return this.lazyData.getI18nName(content, +id, field as keyof Extract<LazyDataEntries[this['content']], I18nName>).pipe(
        map(name => name || (fallback && this.i18n.createFakeI18n(fallback)))
      );
    }),
    filter(Boolean)
  );

  @Input()
  content: LazyDataI18nKey;

  @Input()
  id: number | string;

  @Input()
  width = 150;

  @Input()
  fallback?: string;

  @Input()
  field?: keyof Extract<LazyDataEntries[this['content']], I18nName>;

  constructor(private lazyData: LazyDataFacade,
              private i18n: I18nToolsService) {
  }

}
