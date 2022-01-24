import { AbstractExtractor } from '../abstract-extractor';
import { createReadStream } from 'fs-extra';
import { join } from 'path';
import csv from 'csv-parser';

export class MonsterDropsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    // Base handmade data
    const drops = {};
    const monsters = require('../../../../client/src/assets/data/mobs.json');
    const items = require('../../../../client/src/assets/data/items.json');
    const sheetRows = [];
    // Credits to Hiems Whiterock / M'aila Batih for the data sheet
    createReadStream(join(__dirname, '../../../input/monster-drops.csv'), 'utf-8')
      .pipe(csv())
      .on('data', (row) => {
        sheetRows.push(row);
      })
      .on('end', () => {
        sheetRows.forEach((row, index) => {
          const monsterId = +Object.keys(monsters).find(key => monsters[key].en.toLowerCase() === row.Monster.toLowerCase());
          if (isNaN(monsterId)) {
            // console.log('Invalid row', index, row);
          } else {
            const dropNames = row.Drops.split(',');
            const monsterDrops = [];
            for (const dropName of dropNames) {
              const name = dropName.trim();
              const itemId = +Object.keys(items).find(key => items[key].en.toLowerCase() === name.toLowerCase());
              if (isNaN(itemId)) {
                // console.log('Invalid row drop', index, row, name);
              } else {
                monsterDrops.push(itemId);
              }
            }
            drops[monsterId] = monsterDrops;
          }
        });
        this.persistToTypescript('monster-drops', 'monsterDrops', drops);
        this.done();
      });
  }

  getName(): string {
    return 'monster-drops';
  }

}
