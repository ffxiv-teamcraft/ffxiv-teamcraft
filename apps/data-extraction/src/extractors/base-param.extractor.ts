import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class BaseParamExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const baseParams = {};
    const baseParamColumns = [
      'Name',
      'MeldParam',
      '1HWpn%',
      '2HWpn%',
      'Bracelet%',
      'Chest%',
      'ChestHead%',
      'ChestHeadLegsFeet%',
      'ChestLegsFeet%',
      'ChestLegsGloves%',
      'Earring%',
      'Feet%',
      'Hands%',
      'Head%',
      'HeadChestHandsLegsFeet%',
      'Legs%',
      'LegsFeet%',
      'Necklace%',
      'OH%',
      'Order',
      'Ring%',
      'Waist%'
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
