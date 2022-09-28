import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { switchMap } from 'rxjs/operators';
import { IslandAnimal } from '../../list/model/island-animal';
import { combineLatest, Observable } from 'rxjs';
import { LazyIslandAnimal } from '../../../lazy-data/model/lazy-island-animal';

@Component({
  selector: 'app-island-animal',
  templateUrl: './island-animal.component.html',
  styleUrls: ['./island-animal.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IslandAnimalComponent extends ItemDetailsPopup<IslandAnimal[]> {

  animalsDetails$: Observable<LazyIslandAnimal[]> = this.details$.pipe(
    switchMap(details => {
      return combineLatest(details.map(animal => this.lazyData.getRow('islandAnimals', animal.id)));
    })
  );

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

}
