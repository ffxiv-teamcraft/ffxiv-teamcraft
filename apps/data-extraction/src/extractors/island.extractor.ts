import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest, reduce, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export class IslandExtractor extends AbstractExtractor {

  protected doExtract(): void {
    const gatheringDone$ = new Subject();
    const buildingsDone$ = new Subject();
    const workshopDone$ = new Subject();


    this.get('https://xivapi.com/Map/772').pipe(
      switchMap(islandMap => {
        return this.getAllPages('https://xivapi.com/MJIGatheringItem?columns=Item,Radius,X,Y').pipe(
          reduce((mjiGatheringItems, page) => {
            page.Results
              .filter(item => !!item.Item)
              .forEach(item => {
                let pos = this.getCoords({
                  x: item.X,
                  y: item.Y,
                  z: 0
                }, {
                  size_factor: islandMap.SizeFactor,
                  offset_y: +islandMap.OffsetY,
                  offset_x: +islandMap.OffsetX,
                  offset_z: 0
                });
                if (item.Item.ID === 37562) {
                  pos = {
                    x: 18,
                    y: 17.6,
                    z: 0
                  };
                }
                mjiGatheringItems[item.Item.ID] = {
                  itemId: item.Item.ID,
                  ...pos,
                  radius: item.Radius
                };
              });
            return mjiGatheringItems;
          }, {})
        );
      })
    ).subscribe((mjiGatheringItems) => {
      this.persistToJsonAsset('island-gathering-items', mjiGatheringItems);
      gatheringDone$.next(true);
    });

    this.aggregateAllPages('https://xivapi.com/MJIBuilding?columns=Material0,Amount0,Material1,Amount1,Material2,Amount2,Material3,Amount3,Material4,Amount4,Name,IconHD,ID').pipe(
      map(mjiBuildings => {
        return mjiBuildings
          .reduce((buildings, building) => {
            const ID = -10000 + -1 * (+building.ID * 100);
            const ingredients = Object.keys(building)
              .filter(k => /Material\d/.test(k))
              .sort((a, b) => a < b ? -1 : 1)
              .filter(key => !!building[key])
              .map((key) => {
                const index = +/Material(\d)/.exec(key)[1];
                return {
                  id: building[key].ItemTargetID,
                  amount: +building[`Amount${index}`]
                };
              })
              .filter(i => !!i.id);
            return {
              ...buildings,
              [ID]: {
                key: building.ID,
                icon: building.IconHD,
                en: building.Name.Text_en,
                de: building.Name.Text_de,
                ja: building.Name.Text_ja,
                fr: building.Name.Text_fr,
                ingredients
              }
            };
          }, {});
      })
    ).subscribe(buildings => {
      this.persistToJsonAsset('island-buildings', buildings);
      buildingsDone$.next(true);
    });

    combineLatest([
      this.aggregateAllPages('https://xivapi.com/MJICraftworksPopularity?columns=*'),
      this.aggregateAllPages('https://xivapi.com/MJICraftworksSupplyDefine?columns=ID,Ratio'),
      this.aggregateAllPages('https://xivapi.com/MJICraftworksObject?columns=ID,ItemTargetID,CraftingTime,Value,Theme0TargetID,Theme1TargetID')
    ]).pipe(
      map(([popularity, supplyDefine, craftworksObjects]) => {
        const supplyObj = supplyDefine.reduce((acc, row) => {
          return {
            ...acc,
            [row.ID]: row.Ratio
          };
        }, {});

        const popularityMatrix = popularity.reduce((acc, row) => {
          const entry = Object.keys(row)
            .filter(k => /^Popularity\d+$/.test(k))
            .sort((a, b) => a < b ? -1 : 1)
            .reduce((eacc, key) => {
              const id = +/^Popularity(\d+)$/.exec(key)[1];
              return {
                ...eacc,
                [id]: {
                  id: row[key].ID,
                  ratio: row[key].Ratio
                }
              };
            }, {});
          return {
            ...acc,
            [row.ID]: entry
          };
        }, {});

        const craftworksIndex = craftworksObjects.reduce((acc, obj) => {
          return {
            ...acc,
            [obj.ID]: {
              itemId: obj.ItemTargetID,
              value: obj.Value,
              craftingTime: obj.CraftingTime,
              themes: [obj.Theme0TargetID, obj.Theme1TargetID].filter(theme => theme > 0)
            }
          };
        }, {});

        return {
          supplyObj,
          popularityMatrix,
          craftworksIndex
        };
      })
    ).subscribe(({ supplyObj, popularityMatrix, craftworksIndex }) => {
      this.persistToJsonAsset('island-supply', supplyObj);
      this.persistToJsonAsset('island-popularity', popularityMatrix);
      this.persistToJsonAsset('island-craftworks', craftworksIndex);
      workshopDone$.next(true);
    });

    combineLatest([
      gatheringDone$,
      buildingsDone$,
      workshopDone$
    ]).subscribe(() => {
      this.done();
    });
  }

  getName(): string {
    return 'island sanctuary';
  }

}
