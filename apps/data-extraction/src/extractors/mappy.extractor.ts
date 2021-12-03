import { combineLatest, Subject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { AbstractExtractor } from '../abstract-extractor';

export class MappyExtractor extends AbstractExtractor {
  private nodes = {};
  private gatheringPointToBaseId = {};
  private monsters = {};

  public isSpecific = true;

  doExtract(): void {
    const mapData$ = this.get('https://xivapi.com/mappy/json');
    const nodes$ = new Subject();


    const mapDiscoveryIndexes$ = this.aggregateAllPages('https://xivapi.com/map?columns=ID,DiscoveryIndex');

    combineLatest([mapData$, nodes$.pipe(skip(1)), mapDiscoveryIndexes$])
      .subscribe(([mapData, , mapDiscoveryIndexes]) => {
        mapData
          .sort((a, b) => {
            return a.Added - b.Added;
          })
          .forEach(row => {
            if (row.Type === 'BNPC') {
              const mapEntry = mapDiscoveryIndexes.find(m => m.ID === +row.MapID);
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
            if (row.Type === 'Node') {
              const excludedGatheringPointBases = [31481, 31482, 31483];
              if (excludedGatheringPointBases.includes(+row.NodeID)) {
                return;
              }
              const baseId = this.gatheringPointToBaseId[+row.NodeID];
              if (baseId && +row.MapID) {
                this.nodes[baseId] = {
                  ...this.nodes[baseId],
                  map: this.nodes[baseId].map || +row.MapID,
                  zoneid: this.nodes[baseId].zoneid || +row.PlaceNameID,
                  x: Math.round(+row.PosX * 10) / 10,
                  y: Math.round(+row.PosY * 10) / 10,
                  z: Math.round(+row.PosZ * 10) / 10
                };
                // South shroud hotfix.
                if (this.nodes[baseId].map === 181) {
                  this.nodes[baseId].map = 6;
                }
              }
            }
          });
        // Write data that needs to be joined with game data first
        this.persistToJsonAsset('nodes', this.nodes);
        // console.log('nodes written');
        this.persistToJsonAsset('monsters', this.monsters);
        this.done();
      });
  }

  getName(): string {
    return 'mappy';
  }

}
