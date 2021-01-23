import { AbstractExtractor } from '../abstract-extractor';

export class BaseParamExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const baseParams = {};
    const baseParamColumns = [
      'ID',
      'Name_*',
      'MeldParam0',
      'MeldParam1',
      'MeldParam2',
      'MeldParam3',
      'MeldParam4',
      'MeldParam5',
      'MeldParam6',
      'MeldParam7',
      'MeldParam8',
      'MeldParam9',
      'MeldParam10',
      'MeldParam11',
      'MeldParam12',
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
    this.getAllPages(`https://xivapi.com/BaseParam?columns=${baseParamColumns.join(',')}`).subscribe(page => {
      page.Results.forEach(entry => {
        baseParams[entry.ID] = entry;
      });
    }, null, () => {
      this.persistToJsonAsset('base-params', baseParams);
      this.done();
    });
  }

  getName(): string {
    return 'base-params';
  }

}
