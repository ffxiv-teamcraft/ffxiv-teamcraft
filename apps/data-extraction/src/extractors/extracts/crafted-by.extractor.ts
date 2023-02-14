import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { CompactMasterbook, CraftedBy, DataType } from '@ffxiv-teamcraft/types';
import { MasterbookClass } from '@ffxiv-teamcraft/data/model/lazy-recipe';

export class CraftedByExtractor extends AbstractItemDetailsExtractor<CraftedBy[]> {
  recipes = this.requireLazyFile('recipesPerItem');

  doExtract(itemId: number): CraftedBy[] {
    return (this.recipes[itemId] || []).map(
      recipe => {
        const { yields, masterbook, ...withoutYields } = recipe;
        const result: CraftedBy = {
          ...withoutYields,
          itemId,
          yield: recipe.yields,
          stars_tooltip: this.generateStars(recipe.stars),
          id: recipe.id.toString(),
          hq: recipe.hq ? 1 : 0
        };
        if (recipe.masterbook) {
          let masterbookEntry: CompactMasterbook = {
            id: recipe.masterbook
          };
          if (recipe.masterbook && typeof recipe.masterbook !== 'number' && (recipe.masterbook as MasterbookClass).id) {
            masterbookEntry = {
              id: +(recipe.masterbook as MasterbookClass).id,
              name: (recipe.masterbook as MasterbookClass).name
            };
          }
          result.masterbook = masterbookEntry;
        }
        return result;
      }
    );
  }

  getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

}
