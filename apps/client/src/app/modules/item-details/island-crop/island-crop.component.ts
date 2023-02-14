import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map, switchMap } from 'rxjs/operators';
import { IslandCrop } from '../../list/model/island-crop';
import { getItemSource } from '@ffxiv-teamcraft/types';
import { DataType } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-island-crop',
  templateUrl: './island-crop.component.html',
  styleUrls: ['./island-crop.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IslandCropComponent extends ItemDetailsPopup<IslandCrop> {

  public gatheringDetails$ = this.details$.pipe(
    switchMap(details => {
      return this.lazyData.getRow('extracts', details.seed).pipe(
        map(seedExtract => getItemSource(seedExtract, DataType.GATHERED_BY))
      );
    })
  );

  constructor(private lazyData: LazyDataFacade) {
    super();
  }
}
