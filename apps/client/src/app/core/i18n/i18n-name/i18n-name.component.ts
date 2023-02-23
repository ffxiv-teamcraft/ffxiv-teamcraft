import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest } from 'rxjs';
import { LazyDataI18nKey } from '@ffxiv-teamcraft/types';
import { filter, map, switchMap } from 'rxjs/operators';
import { observeInput } from '../../rxjs/observe-input';
import { I18nToolsService } from '../../tools/i18n-tools.service';

@Component({
  selector: 'app-i18n-name',
  templateUrl: './i18n-name.component.html',
  styleUrls: ['./i18n-name.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class I18nNameComponent {

  public i18nName$ = combineLatest([
    observeInput(this, 'content'),
    observeInput(this, 'id'),
    observeInput(this, 'fallback', true)
  ]).pipe(
    filter(([, id]) => id !== null),
    switchMap(([content, id, fallback]) => {
      return this.lazyData.getI18nName(content, id).pipe(
        map(name => name || (fallback && this.i18n.createFakeI18n(fallback)))
      );
    })
  );

  @Input()
  content: LazyDataI18nKey;

  @Input()
  id: number;

  @Input()
  width = 150;

  @Input()
  fallback?: string;

  constructor(private lazyData: LazyDataFacade,
              private i18n: I18nToolsService) {
  }

}
