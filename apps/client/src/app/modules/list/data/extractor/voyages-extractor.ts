import { AbstractExtractor } from './abstract-extractor';
import { I18nName } from '../../../../model/common/i18n-name';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

export class VoyagesExtractor extends AbstractExtractor<I18nName[]> {

  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.VOYAGES;
  }

  protected canExtract(item: Item): boolean {
    return item.voyages !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): I18nName[] {
    const voyages: I18nName[] = [];
    if (item.voyages !== undefined) {
      item.voyages.forEach(v => {
        voyages.push({
          en: v,
          fr: v,
          de: v,
          ja: v
        });
      });
    }
    return voyages;
  }

}
