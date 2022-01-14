import { AbstractExtractor } from '../abstract-extractor';
import { createReadStream } from 'fs-extra';
import { join } from 'path';
import * as csv from 'csv-parser';

export class ReductionsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    // Base handmade data
    const reductions = {};
    const items = require('../../../../client/src/assets/data/items.json');
    const sheetRows = [];
    // Credits to Hiems Whiterock / M'aila Batih for the data sheet
    createReadStream(join(__dirname, '../../../input/shb-fish-desynth.csv'), 'utf-8')
      .pipe(csv())
      .on('data', (row) => {
        sheetRows.push(row);
      })
      .on('end', () => {
        // Pop first item, as it's the credit row
        sheetRows.pop();
        sheetRows.forEach((row, index) => {
          const itemReductions = [];
          const itemId = +Object.keys(items).find(key => items[key].en.toLowerCase() === row.Item.toLowerCase());
          if (!isNaN(itemId) && itemId > 500) {
            for (let i = 0; i < 5; i++) {
              if (row[`r${i}`] && row[`r${i}`].length > 0) {
                const reductionId = +Object.keys(items).find(key => items[key].en.toLowerCase() === row[`r${i}`].toLowerCase());
                if (!isNaN(reductionId)) {
                  itemReductions.push(reductionId);
                }
              }
            }
            reductions[itemId] = itemReductions;
          }
        });
        this.persistToTypescript('reductions', 'reductions', reductions);
        this.done();
      });
  }

  getName(): string {
    return 'reductions';
  }

}
