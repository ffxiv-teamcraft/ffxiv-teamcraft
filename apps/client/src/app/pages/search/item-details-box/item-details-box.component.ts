import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { SearchResult } from '@ffxiv-teamcraft/types';
import { observeInput } from '../../../core/rxjs/observe-input';
import { map, switchMap } from 'rxjs/operators';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { XivapiItemTooltipComponent } from '../../../modules/tooltip/xivapi-tooltip/xivapi-item-tooltip.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-item-details-box',
    templateUrl: './item-details-box.component.html',
    styleUrls: ['./item-details-box.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzButtonModule, NzWaveModule, NzIconModule, NgIf, XivapiItemTooltipComponent, NzSpinModule, AsyncPipe]
})
export class ItemDetailsBoxComponent {

  @Input({ required: true })
  searchResult: SearchResult;

  @Output()
  remove = new EventEmitter<void>();

  data$ = observeInput(this, 'searchResult').pipe(
    switchMap(item => {
      return this.lazyData.getRow('itemsDatabasePages', +item.itemId).pipe(
        map(data => {
          return {
            ...data,
            sources: item.sources
          };
        })
      );
    })
  );

  constructor(private lazyData: LazyDataFacade) {
  }
}
