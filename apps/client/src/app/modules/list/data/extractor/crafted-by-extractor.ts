import { AbstractExtractor } from './abstract-extractor';
import { CraftedBy } from '../../model/crafted-by';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

  constructor(protected gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

  protected canExtract(item: Item): boolean {
    return this.lazyData.data.recipes.some(recipe => recipe.result === item.id);
  }

  protected doExtract(item: Item): CraftedBy[] {
    return this.lazyData.data.recipes.filter(recipe => recipe.result === item.id)
      .map(craft => {
        const craftedBy: CraftedBy = {
          itemId: item.id,
          icon: `./assets/icons/classjob/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
          job: craft.job,
          lvl: craft.lvl,
          stars_tooltip: craft.stars > 0 ? `(${craft.stars}★)` : '',
          id: craft.id,
          rlvl: craft.rlvl,
          durability: craft.durability,
          progression: craft.progress,
          quality: craft.quality,
          yield: craft.yields
        };
        if (craft.job === 0) {
          craftedBy.icon = '';
        }
        return craftedBy;
      });
  }

}
