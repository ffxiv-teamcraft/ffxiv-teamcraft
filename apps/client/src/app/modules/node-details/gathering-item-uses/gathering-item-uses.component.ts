import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { observeInput } from '../../../core/rxjs/observe-input';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-gathering-item-uses',
    templateUrl: './gathering-item-uses.component.html',
    styleUrls: ['./gathering-item-uses.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzPopoverModule, FlexModule, NgFor, AsyncPipe, TranslateModule, ItemNamePipe, XivapiIconPipe, LazyIconPipe, I18nPipe]
})
export class GatheringItemUsesComponent {

  @Input()
  compact = false;

  @Input()
  itemId: number;

  itemId$ = observeInput(this, 'itemId');

  reduction$ = this.itemId$.pipe(
    filter(Boolean),
    switchMap(itemId => {
      return combineLatest([
        this.lazyData.getRow('aetherialReduce', itemId, 0),
        this.lazyData.getRow('reverseReduction', itemId, [])
      ]).pipe(
        map(([reduce, reduction]) => {
          return reduce > 0 ? reduction : [];
        })
      );
    })
  );

  collectable$ = this.itemId$.pipe(
    filter(Boolean),
    switchMap(itemId => {
      return this.lazyData.getRow('collectables', itemId).pipe(
        map(collectable => {
          if (!collectable || collectable?.collectable === 0) {
            return null;
          }
          return collectable;
        })
      );
    })
  );

  constructor(private lazyData: LazyDataFacade) {
  }

}
