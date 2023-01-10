import { combineLatest, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class NodesExtractor extends AbstractExtractor {

  private gatheringItems = {};

  private gatheringPoints = {};

  private gatheringItemPoints = {};

  private nodes = {};

  private gatheringPointToBaseId = {};

  public isSpecific = true;

  doExtract(xiv: XivDataService): void {

    const nodes$ = new Subject();
    const gatheringPointToBaseId$ = new Subject();

    const gatheringItems$ = new Subject();
    const gatheringPoints$ = new Subject();
    const gatheringItemPoints$ = new Subject();


    this.getSheet<any>(xiv, 'GatheringItem', ['GatheringItemLevel.GatheringItemLevel', 'GatheringItemLevel.Stars', 'IsHidden', 'Item#'], false, 1)
      .subscribe(entries => {
        entries
          .filter(item => item.GatheringItemLevel && item.Item > 0)
          .forEach(item => {
            this.gatheringItems[item.index] = {
              level: item.GatheringItemLevel.GatheringItemLevel,
              stars: item.GatheringItemLevel.Stars,
              itemId: item.Item,
              hidden: item.IsHidden ? 1 : 0
            };
          });
        this.persistToJsonAsset('gathering-items', this.gatheringItems);
        gatheringItems$.next(this.gatheringItems);
      });

    this.getSheet<any>(xiv, 'GatheringItemPoint', ['GatheringPoint']).subscribe(entries => {
      entries
        .filter(item => item.GatheringPoint > 0)
        .forEach(item => {
          this.gatheringItemPoints[item.GatheringPoint] = [
            ...(this.gatheringItemPoints[item.GatheringPoint] || []),
            item.index
          ];
        });
      gatheringItemPoints$.next(this.gatheringItemPoints);
    });

    combineLatest([
      this.getSheet<any>(xiv, 'GatheringPoint', ['PlaceName#',
        'TerritoryType.PlaceName', 'TerritoryType.Map.OffsetX', 'TerritoryType.Map.OffsetY', 'TerritoryType.Map.SizeFactor',
        'GatheringPointBase#'], false, 2),
      this.getSheet<any>(xiv, 'GatheringPointTransient', null, false, 1),
      this.getSheet<any>(xiv, 'ExportedGatheringPoint')
    ]).subscribe(([entries, transients, exported]) => {
      entries
        .forEach(point => {
          point.GatheringPointTransient = transients.find(t => t.index === point.index);
          point.ExportedGatheringPoint = exported.find(e => e.index === point.GatheringPointBase);
          if (!point.ExportedGatheringPoint) {
            return;
          }

          if (point.PlaceName === 0 && point.TerritoryType) {
            point.PlaceName = point.TerritoryType.PlaceName.index;
          }
          this.gatheringPoints[point.index] = {
            base: point.GatheringPointBase,
            legendary: point.GatheringPointTransient.GatheringRarePopTimeTable?.index !== 0,
            ephemeral: point.GatheringPointTransient.EphemeralStartTime < 65535,
            spawns: [],
            duration: 0,
            zoneid: point.PlaceName,
            ...(point.TerritoryType?.Map ? this.getCoords({
              x: +point.ExportedGatheringPoint.X,
              y: +point.ExportedGatheringPoint.Y,
              z: 0
            }, {
              offset_x: +point.TerritoryType.Map.OffsetX,
              offset_y: +point.TerritoryType.Map.OffsetY,
              offset_z: 0,
              size_factor: point.TerritoryType.Map.SizeFactor
            }) : { x: 0, y: 0, z: 0 })
          };
          if (point.TerritoryType) {
            this.gatheringPoints[point.index].map = point.TerritoryType.Map.index;
          }
          if (this.gatheringPoints[point.index].ephemeral) {
            const endTime = point.GatheringPointTransient.EphemeralEndTime || 2400;
            let duration = 60 * Math.abs(endTime - point.GatheringPointTransient.EphemeralStartTime) / 100;
            if (endTime < point.GatheringPointTransient.EphemeralStartTime) {
              duration = 60 * Math.abs(2400 - point.GatheringPointTransient.EphemeralStartTime + endTime) / 100;
            }
            this.gatheringPoints[point.index].spawns = [point.GatheringPointTransient.EphemeralStartTime / 100];
            this.gatheringPoints[point.index].duration = duration;
          } else if (this.gatheringPoints[point.index].legendary) {
            this.gatheringPoints[point.index].spawns = [0, 1, 2].map(index => {
              return point.GatheringPointTransient.GatheringRarePopTimeTable.StartTime[index];
            }).filter(start => start < 65535).map(start => start / 100);
            this.gatheringPoints[point.index].duration = point.GatheringPointTransient.GatheringRarePopTimeTable.Durationm[0];
            if (this.gatheringPoints[point.index].duration === 160) {
              this.gatheringPoints[point.index].duration = 120;
            }
            if (this.gatheringPoints[point.index].duration === 300) {
              this.gatheringPoints[point.index].duration = 180;
            }
          }
        });
      gatheringPoints$.next(this.gatheringPoints);
    });

    combineLatest([
      this.getSheet<any>(xiv, 'GatheringPointBase', ['GatheringType#', 'Item.Item#', 'GatheringLevel#'], false, 1),
      gatheringItems$, gatheringPoints$, gatheringItemPoints$])
      .subscribe(([entries, items, gatheringPoints, gatheringItemPoints]: any[]) => {
        entries.forEach(node => {
          let linkedPoints = Object.keys(gatheringPoints).filter(key => gatheringPoints[key].base === node.index).map(key => +key);

          let point = gatheringPoints[linkedPoints[linkedPoints.length - 1]];
          // Hotfix for Rarefied Pyrite
          if (node.index === 306) {
            point = gatheringPoints[31437];
          }
          const hiddenItems = linkedPoints
            .map(p => (gatheringItemPoints[p] || []))
            .flat()
            .filter(i => items[i].hidden)
            .map(i => items[i].itemId);
          this.nodes[node.index] = {
            ...this.nodes[node.index],
            items: node.Item
              .filter(i => i.Item > 0)
              .map(i => i.Item),
            limited: point && (point.legendary || point.ephemeral),
            level: node.GatheringLevel,
            type: node.GatheringType
          };
          if (point) {
            this.nodes[node.index] = {
              ...this.nodes[node.index],
              ...point
            };
          }
          if (hiddenItems.length > 0) {
            this.nodes[node.index] = {
              ...this.nodes[node.index],
              hiddenItems
            };
          }
          if (linkedPoints.length > 0) {
            linkedPoints.forEach(p => {
              this.gatheringPointToBaseId[p] = node.index;
            });
          }
        });
        nodes$.next(this.nodes);
        this.persistToJsonAsset('gathering-point-to-node-id', this.gatheringPointToBaseId);
        gatheringPointToBaseId$.next(this.gatheringPointToBaseId);
      });


    combineLatest([
      this.getSheet<any>(xiv, 'GatheringSubCategory', ['Item'], true),
      this.getSheet<any>(xiv, 'GatheringPoint', ['GatheringSubCategory']),
      gatheringPointToBaseId$,
      nodes$.pipe(first())
    ])
      .subscribe(([gatheringSubCategories, gatheringPoints, pointToBaseId, nodes]) => {
        gatheringSubCategories.forEach(subCategory => {
          const pointsUsingThisCategory = gatheringPoints.filter(p => p.GatheringSubCategory === subCategory.index);
          if (pointsUsingThisCategory.length > 0 && subCategory.Item > 0) {
            pointsUsingThisCategory
              .forEach(point => {
                nodes[pointToBaseId[point.index]].folklore = subCategory.Item;
              });
          }
        });

        this.persistToJsonAsset('nodes', nodes);
        this.done();
      });
  }

  getName(): string {
    return 'nodes';
  }

}
