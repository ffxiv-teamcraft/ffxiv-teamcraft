import { XivapiList } from '@xivapi/angular-client';
import { combineLatest, Subject } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { AbstractExtractor } from '../abstract-extractor';

export class NodesExtractor extends AbstractExtractor {

  private gatheringItems = {};

  private gatheringPoints = {};

  private gatheringItemPoints = {};

  private nodes = {};

  private gatheringPointToBaseId = {};

  public isSpecific = true;

  doExtract(): void {

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

    this.getAllPages('https://xivapi.com/GatheringPoint?columns=ID,GatheringPointTransient,PlaceNameTargetID,TerritoryType,ExportedGatheringPoint').subscribe(page => {
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
            zoneid: point.PlaceNameTargetID,
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
        return this.getAllPages('https://xivapi.com/GatheringPointBase?columns=ID,GatheringTypeTargetID,Item0,Item1,Item2,Item3,Item4,Item5,Item6,Item7,GameContentLinks,GatheringLevel')
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
            .filter(i => node[`Item${i}`] !== null)
            .map(i => node[`Item${i}`])
            .map(gatheringItem => {
              return gatheringItem.ItemTargetID;
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

        this.persistToJsonAsset('nodes', nodes);
        this.done();
      });
  }

  getName(): string {
    return 'nodes';
  }

}
