import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { CompactMasterbook, CraftedBy, DataType } from '@ffxiv-teamcraft/types';
import { MasterbookClass } from '@ffxiv-teamcraft/data/model/lazy-recipe';

export class CraftedByExtractor extends AbstractItemDetailsExtractor<CraftedBy[]> {
  recipes = this.requireLazyFile('recipes');

  doExtract(itemId: number): CraftedBy[] {
    return this.recipes
      .filter(recipe => recipe.result === itemId)
      .map(craft => {
        const craftedBy: CraftedBy = {
          itemId: itemId,
          job: craft.job,
          lvl: craft.lvl,
          stars_tooltip: craft.stars > 0 ? `(${this.generateStars(craft.stars)}★)` : '',
          id: craft.id.toString(),
          rlvl: craft.rlvl,
          durability: craft.durability,
          progression: craft.progress,
          quality: craft.quality,
          yield: craft.yields,
          isIslandRecipe: craft.isIslandRecipe || false
        };
        if (craft.masterbook) {
          let masterbookEntry: CompactMasterbook = {
            id: craft.masterbook as number
          };
          if (craft.masterbook && typeof craft.masterbook !== 'number' && (craft.masterbook as MasterbookClass).id) {
            masterbookEntry = {
              id: +(craft.masterbook as MasterbookClass).id,
              name: (craft.masterbook as MasterbookClass).name
            };
          }
          craftedBy.masterbook = masterbookEntry;
        }
        return craftedBy;
      }
    );
  }

  getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

}
