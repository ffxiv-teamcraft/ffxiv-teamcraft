import { AbstractExtractor } from './abstract-extractor';
import { I18nName } from '../../../../model/common/i18n-name';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { ExplorationType } from '../../../../model/other/exploration-type';
import { uniqBy } from 'lodash';

export class VoyagesExtractor extends AbstractExtractor<I18nName[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.VOYAGES;
  }

  protected canExtract(item: Item): boolean {
    return item.voyages !== undefined || this.lazyData.data.voyageSources[item.id] !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): I18nName[] {
    const voyages: I18nName[] = [];
    if (item.voyages !== undefined) {
      item.voyages.forEach(v => {
        const entry = [
          ...Object.values<I18nName>(this.lazyData.data.airshipVoyages),
          ...Object.values<I18nName>(this.lazyData.data.submarineVoyages)
        ].find(e => e.en.toLowerCase() === v.toLowerCase());
        if (entry) {
          voyages.push({ ...entry });
        } else {
          voyages.push({
            en: v,
            fr: v,
            de: v,
            ja: v
          });
        }
      });
    }
    if (this.lazyData.data.voyageSources[item.id] !== undefined) {
      this.lazyData.data.voyageSources[item.id].forEach(({ type, id }) => {
        voyages.push((type === ExplorationType.AIRSHIP ? this.lazyData.data.airshipVoyages : this.lazyData.data.submarineVoyages)[id]);
      });
    }
    return uniqBy(voyages, 'en');
  }

}
