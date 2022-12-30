import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class MappyExtractor extends AbstractExtractor {
  private monsters = {};

  public isSpecific = true;

  doExtract(xiv: XivDataService): void {
    const mapData$ = this.get('https://xivapi.com/mappy/json');


    const mapDiscoveryIndexes$ = this.getSheet<any>(xiv, 'Map', ['DiscoveryIndex']);

    combineLatest([mapData$, mapDiscoveryIndexes$])
      .subscribe(([mapData, mapDiscoveryIndexes]) => {
        mapData
          .sort((a, b) => {
            return a.Added - b.Added;
          })
          .forEach(row => {
            if (row.Type === 'BNPC') {
              const mapEntry = mapDiscoveryIndexes.find(m => m.index === +row.MapID);
              if (+mapEntry.DiscoveryIndex < 1) {
                return;
              }
              const bnpcNameID = +row.BNpcNameID;
              // const monsterMemoryRow = memoryData.find(mRow => mRow.Hash === row.Hash);
              this.monsters[bnpcNameID] = this.monsters[row.BNpcNameID] || {
                baseid: +row.BNpcBaseID,
                positions: []
              };
              const newEntry = {
                map: +row.MapID,
                zoneid: +row.PlaceNameID,
                level: +row.Level,
                hp: +row.HP,
                fate: +row.FateID,
                x: Math.round(+row.PosX * 10) / 10,
                y: Math.round(+row.PosY * 10) / 10,
                z: Math.round(+row.PosZ * 10) / 10
              };
              this.monsters[bnpcNameID].positions.push(newEntry);
            }
          });
        this.persistToJsonAsset('monsters', this.monsters);
        this.done();
      });
  }

  getName(): string {
    return 'mappy';
  }

}
