import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class BaseParamExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const baseParams = {};
    const baseParamColumns = [
      'Name',
      'MeldParam',
      'OneHandWeaponPercent',
      'TwoHandWeaponPercent',
      'BraceletPercent',
      'ChestPercent',
      'ChestHeadPercent',
      'ChestHeadLegsFeetPercent',
      'ChestLegsFeetPercent',
      'ChestLegsGlovesPercent',
      'EarringPercent',
      'FeetPercent',
      'HandsPercent',
      'HeadPercent',
      'HeadChestHandsLegsFeetPercent',
      'LegsPercent',
      'LegsFeetPercent',
      'NecklacePercent',
      'OffHandPercent',
      'Order',
      'RingPercent',
      'WaistPercent'
    ];
    this.getSheet(xiv, 'BaseParam', baseParamColumns)
      .subscribe(entries => {
        entries.forEach(entry => {
          if (entry.index === 0) {
            return;
          }
          baseParams[entry.index] = this.sortProperties(this.removeIndexes(entry));
        });
        this.persistToJsonAsset('base-params', baseParams);
        this.done();
      });
  }

  getName(): string {
    return 'base-params';
  }

}
