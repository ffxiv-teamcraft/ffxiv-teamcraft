import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-island-animal',
  templateUrl: './island-animal.component.html',
  styleUrls: ['./island-animal.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IslandAnimalComponent extends ItemDetailsPopup<IslandAnimalComponent[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

}
