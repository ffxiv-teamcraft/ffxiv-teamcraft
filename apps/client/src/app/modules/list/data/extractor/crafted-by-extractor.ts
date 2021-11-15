import { AbstractExtractor } from './abstract-extractor';
import { CraftedBy } from '../../model/crafted-by';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MasterbookClass } from '../../../../lazy-data/model/lazy-recipe';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

  constructor(protected gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  public isAsync(): boolean {
    return true;
  }

  public getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item): Observable<CraftedBy[]> {
    return this.lazyData.getRecipes().pipe(
      map(recipes => {
        return recipes
          .filter(recipe => recipe.result === item.id)
          .map(craft => {
            const craftedBy: CraftedBy = {
              itemId: item.id,
              icon: `./assets/icons/classjob/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
              job: craft.job,
              lvl: craft.lvl,
              stars_tooltip: craft.stars > 0 ? `(${craft.stars}★)` : '',
              id: craft.id.toString(),
              rlvl: craft.rlvl,
              durability: craft.durability,
              progression: craft.progress,
              quality: craft.quality,
              yield: craft.yields
            };
            if (craft.job === 0) {
              craftedBy.icon = '';
            }
            if (craft.masterbook && typeof craft.masterbook === 'number') {
              craftedBy.masterbook = {
                id: craft.masterbook,
                icon: 0
              };
            } else if (craft.masterbook && (craft.masterbook as MasterbookClass).id) {
              craftedBy.masterbook = {
                id: (craft.masterbook as MasterbookClass).id,
                icon: 0
              };
            }
            return craftedBy;
          });
      })
    );
  }

}
