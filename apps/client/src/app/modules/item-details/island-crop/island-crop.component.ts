import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map, switchMap } from 'rxjs/operators';
import { IslandCrop } from '../../list/model/island-crop';
import { getItemSource } from '@ffxiv-teamcraft/types';
import { DataType } from '@ffxiv-teamcraft/types';
import { MapComponent } from '../../map/map/map.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-island-crop',
    templateUrl: './island-crop.component.html',
    styleUrls: ['./island-crop.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, ItemIconComponent, I18nNameComponent, NgIf, MapComponent, AsyncPipe]
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
