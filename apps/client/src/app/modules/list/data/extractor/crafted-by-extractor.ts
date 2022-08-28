import { AbstractExtractor } from './abstract-extractor';
import { CraftedBy } from '../../model/crafted-by';
import { DataType } from '../data-type';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MasterbookClass } from '../../../../lazy-data/model/lazy-recipe';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  public isAsync(): boolean {
    return true;
  }

  public getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

  protected doExtract(itemId: number): Observable<CraftedBy[]> {
    return this.lazyData.getRecipes().pipe(
      map(recipes => {
        return recipes
          .filter(recipe => recipe.result === itemId)
          .map(craft => {
            const craftedBy: CraftedBy = {
              itemId: itemId,
              job: craft.job,
              lvl: craft.lvl,
              stars_tooltip: craft.stars > 0 ? `(${craft.stars}★)` : '',
              id: craft.id.toString(),
              rlvl: craft.rlvl,
              durability: craft.durability,
              progression: craft.progress,
              quality: craft.quality,
              yield: craft.yields,
              isIslandRecipe: craft.isIslandRecipe || false
            };
            if (craft.masterbook && typeof craft.masterbook === 'number') {
              craftedBy.masterbook = {
                id: craft.masterbook
              };
            } else if (craft.masterbook && (craft.masterbook as MasterbookClass).id) {
              craftedBy.masterbook = {
                id: (craft.masterbook as MasterbookClass).id,
                name: (craft.masterbook as MasterbookClass).name
              };
            }
            return craftedBy;
          });
      })
    );
  }

}
