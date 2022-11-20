import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class EquipSlotCategoryExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const equipSlotCategories = {};
    this.getSheet(xiv, `EquipSlotCategory`)
      .subscribe(completeFetch => {
        completeFetch.forEach(entry => {
          equipSlotCategories[entry.index] = entry;
        });
        this.persistToJsonAsset('equip-slot-categories', equipSlotCategories);
        this.done();
      });
  }

  getName(): string {
    return 'equip-slot-categories';
  }

}
