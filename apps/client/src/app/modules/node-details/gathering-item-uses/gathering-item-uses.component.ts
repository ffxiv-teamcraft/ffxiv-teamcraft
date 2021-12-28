import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { observeInput } from '../../../core/rxjs/observe-input';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-gathering-item-uses',
  templateUrl: './gathering-item-uses.component.html',
  styleUrls: ['./gathering-item-uses.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatheringItemUsesComponent {

  @Input()
  compact = false;

  @Input()
  itemId: number;

  itemId$ = observeInput(this, 'itemId');

  reduction$ = this.itemId$.pipe(
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
