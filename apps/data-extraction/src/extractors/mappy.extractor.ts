import { XivapiList } from '@xivapi/angular-client';
import { combineLatest, Subject } from 'rxjs';
import { first, map, skip, switchMap } from 'rxjs/operators';
import { AbstractExtractor } from '../abstract-extractor';

export class MappyExtractor extends AbstractExtractor {

  private gatheringItems = {};
  private gatheringPoints = {};
  private gatheringItemPoints = {};
  private nodes = {};
  private gatheringPointToBaseId = {};
  private monsters = {};

  public isSpecific = true;

  doExtract(): void {
    const mapData$ = this.get('https://xivapi.com/mappy/json');
    const spearFishingItems = require('../../../../client/src/assets/data/spear-fishing-nodes.json');
    const nodes$ = new Subject();
    const gatheringPointToBaseId$ = new Subject();

    const gatheringItems$ = new Subject();
    const gatheringPoints$ = new Subject();
    const gatheringItemPoints$ = new Subject();

    this.getAllPages('https://xivapi.com/GatheringItem?columns=ID,GatheringItemLevel,IsHidden,Item').subscribe(page => {
      page.Results
        .filter(item => item.GatheringItemLevel)
        .forEach(item => {
          this.gatheringItems[item.ID] = {
            level: item.GatheringItemLevel.GatheringItemLevel,
            stars: item.GatheringItemLevel.Stars,
            itemId: item.Item.ID,
            hidden: item.IsHidden
          };
        });
    }, null, () => {
      this.persistToJsonAsset('gathering-items', this.gatheringItems);
      gatheringItems$.next(this.gatheringItems);
    });

    this.getAllPages('https://xivapi.com/GatheringItemPoint?columns=ID,GatheringPointTargetID').subscribe(page => {
      page.Results
        .filter(item => item.GatheringPointTargetID)
        .forEach(item => {
          this.gatheringItemPoints[item.GatheringPointTargetID] = [
            ...(this.gatheringItemPoints[item.GatheringPointTargetID] || []),
            +item.ID.split('.')[0]
          ];
        });
    }, null, () => {
      gatheringItemPoints$.next(this.gatheringItemPoints);
    });

    this.getAllPages('https://xivapi.com/GatheringPoint?columns=ID,GatheringPointTransient,PlaceNameTargetID,TerritoryType.PlaceNameTargetID,TerritoryType.MapTargetID').subscribe(page => {
      page.Results
        .forEach(point => {
          if (point.PlaceNameTargetID === 0 && point.TerritoryType) {
            point.PlaceNameTargetID = point.TerritoryType.PlaceNameTargetID;
          }
          this.gatheringPoints[point.ID] = {
            legendary: point.GatheringPointTransient.GatheringRarePopTimeTableTargetID > 0,
            ephemeral: point.GatheringPointTransient.EphemeralStartTime < 65535,
            spawns: [],
            duration: 0,
            zoneid: point.PlaceNameTargetID
          };
          if (point.TerritoryType) {
            this.gatheringPoints[point.ID].map = point.TerritoryType.MapTargetID;
          }
          if (this.gatheringPoints[point.ID].ephemeral) {
            const endTime = point.GatheringPointTransient.EphemeralEndTime || 2400;
            let duration = 60 * Math.abs(endTime - point.GatheringPointTransient.EphemeralStartTime) / 100;
            if (endTime < point.GatheringPointTransient.EphemeralStartTime) {
              duration = 60 * Math.abs(2400 - point.GatheringPointTransient.EphemeralStartTime + endTime) / 100;
            }
            this.gatheringPoints[point.ID].spawns = [point.GatheringPointTransient.EphemeralStartTime / 100];
            this.gatheringPoints[point.ID].duration = duration;
          } else if (this.gatheringPoints[point.ID].legendary) {
            this.gatheringPoints[point.ID].spawns = [0, 1, 2].map(index => {
              return point.GatheringPointTransient.GatheringRarePopTimeTable[`StartTime${index}`];
            }).filter(start => start < 65535).map(start => start / 100);
            this.gatheringPoints[point.ID].duration = point.GatheringPointTransient.GatheringRarePopTimeTable.DurationM0;
            if (this.gatheringPoints[point.ID].duration === 160) {
              this.gatheringPoints[point.ID].duration = 120;
            }
            if (this.gatheringPoints[point.ID].duration === 300) {
              this.gatheringPoints[point.ID].duration = 180;
            }
          }
        });
    }, null, () => {
      gatheringPoints$.next(this.gatheringPoints);
    });

    combineLatest([gatheringItems$, gatheringPoints$, gatheringItemPoints$]).pipe(
      switchMap(([gi, gp, gip]) => {
        return this.getAllPages('https://xivapi.com/GatheringPointBase?columns=ID,GatheringTypeTargetID,Item0TargetID,Item1TargetID,Item2TargetID,Item3TargetID,Item4TargetID,Item5TargetID,Item6TargetID,Item7TargetID,IsLimited,GameContentLinks,GatheringLevel')
          .pipe(
            map((page) => [page, gi, gp, gip])
          );
      })
    ).subscribe(([page, items, gatheringPoints, gatheringItemPoints]: [XivapiList<any>, any[], any, any]) => {
      page.Results.forEach(node => {
        let linkedPoints = [];
        if (node.GameContentLinks.GatheringPoint) {
          linkedPoints = node.GameContentLinks.GatheringPoint.GatheringPointBase;
        }
        let point = gatheringPoints[linkedPoints[linkedPoints.length - 1]];
        // Hotfix for Rarefied Pyrite
        if (node.ID === 306) {
          point = gatheringPoints[31437];
        }
        const hiddenItems = linkedPoints
          .map(p => (gatheringItemPoints[p] || []))
          .flat()
          .filter(i => items[i].hidden)
          .map(i => items[i].itemId);
        this.nodes[node.ID] = {
          ...this.nodes[node.ID],
          items: [0, 1, 2, 3, 4, 5, 6, 7]
            .filter(i => node[`Item${i}TargetID`] > 0)
            .map(i => node[`Item${i}TargetID`])
            .map(gatheringItemId => {
              if (items[gatheringItemId]) {
                return items[gatheringItemId].itemId;
              } else {
                const spearFishingItem = spearFishingItems.find(i => i.id === gatheringItemId);
                return spearFishingItem && spearFishingItem.itemId;
              }
            })
            .filter(itemId => !!itemId),
          limited: point && (point.legendary || point.ephemeral),
          level: node.GatheringLevel,
          type: node.GatheringTypeTargetID
        };
        if (point) {
          this.nodes[node.ID] = {
            ...this.nodes[node.ID],
            ...point
          };
        }
        if (hiddenItems.length > 0) {
          this.nodes[node.ID] = {
            ...this.nodes[node.ID],
            hiddenItems
          };
        }
        if (linkedPoints.length > 0) {
          linkedPoints.forEach(p => {
            this.gatheringPointToBaseId[p] = node.ID;
          });
        }
      });
      if (page.Pagination.Page === page.Pagination.PageTotal) {
        nodes$.next(this.nodes);
        this.persistToJsonAsset('gathering-point-to-node-id', this.gatheringPointToBaseId);
        gatheringPointToBaseId$.next(this.gatheringPointToBaseId);
      }
    });


    combineLatest([
      this.aggregateAllPages('https://xivapi.com/GatheringSubCategory?columns=ItemTargetID,GameContentLinks', null, 'GatheringSubCategory'),
      gatheringPointToBaseId$,
      nodes$.pipe(first())
    ])
      .subscribe(([GatheringSubCategories, pointToBaseId, nodes]) => {
        GatheringSubCategories.forEach(subCategory => {
          if (subCategory.GameContentLinks.GatheringPoint && subCategory.ItemTargetID > 0) {
            subCategory.GameContentLinks.GatheringPoint.GatheringSubCategory
              .forEach(point => {
                nodes[pointToBaseId[point]].folklore = subCategory.ItemTargetID;
              });
          }
        });
        nodes$.next(nodes);
      });


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
