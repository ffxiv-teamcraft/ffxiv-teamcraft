import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest, reduce, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { XivDataService } from '../xiv/xiv-data.service';

export class IslandExtractor extends AbstractExtractor {

  protected doExtract(xiv: XivDataService): void {
    const gatheringDone$ = new Subject();
    const buildingsDone$ = new Subject();
    const landmarksDone$ = new Subject();
    const workshopDone$ = new Subject();
    const pastureDone$ = new Subject();
    const cropsDone$ = new Subject();


    this.getSheet<any>(xiv, 'Map').pipe(
      map(sheet => sheet.find(m => m.index === 772)),
      switchMap(islandMap => {
        return this.getSheet<any>(xiv, 'MJIGatheringItem', ['Item#', 'Radius', 'X', 'Y']).pipe(
          reduce((mjiGatheringItems, entries) => {
            entries
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
                if (item.Item === 37562) {
                  pos = {
                    x: 18,
                    y: 17.6,
                    z: 0
                  };
                }
                mjiGatheringItems[item.Item] = {
                  itemId: item.Item,
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

    this.getSheet<any>(xiv, 'MJIBuilding', ['Material.Item#', 'Amount', 'Name.Text*', 'Icon'], true, 1).pipe(
      map(mjiBuildings => {
        return mjiBuildings
          .reduce((buildings, building) => {
            const ID = -10000 - (+building.index * 100 + building.subIndex * 10);
            const ingredients = building.Material
              .map((material, index) => {
                return {
                  id: material.Item,
                  amount: +building.Amount[index]
                };
              })
              .filter(i => !!i.id);
            return {
              ...buildings,
              [ID]: {
                key: `${building.index}.${building.subIndex}`,
                icon: this.getIconHD(building.Icon),
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
      this.getSheet<any>(xiv, 'MJIAnimals', ['BNpcBase', 'Reward', 'Icon', 'Size']),
      this.getNonXivapiUrl('https://gubal.hasura.app/api/rest/bnpc')
    ]).pipe(
      map(([mjiAnimals, bnpcs]) => {
        return mjiAnimals.reduce((acc, animal) => {
          return {
            ...acc,
            [animal.index]: {
              id: animal.index,
              rewards: animal.Reward,
              icon: this.getIconHD(animal.Icon),
              bnpcName: bnpcs.bnpc.find(e => e.bnpcBase === animal.BNpcBase)?.bnpcName,
              size: animal.Size
            }
          };
        }, {});
      })
    ).subscribe(animals => {
      this.persistToJsonAsset('island-animals', animals);
      pastureDone$.next(true);
    });

    this.getSheet<any>(xiv, 'MJILandmark', ['Material.Item#', 'Amount', 'Name', 'Icon'], false, 1).pipe(
      map(mjiLandmarks => {
        return mjiLandmarks
          .filter(l => l.Name?.index)
          .reduce((landmarks, landmark) => {
            const ID = -11000 + -1 * (+landmark.index * 10);
            const ingredients = landmark.Material
              .map((material, index) => {
                return {
                  id: material.Item,
                  amount: +landmark.Amount[index]
                };
              })
              .filter(i => !!i.id);
            return {
              ...landmarks,
              [ID]: {
                key: landmark.index,
                icon: this.getIconHD(landmark.Icon),
                en: landmark.Name.Text_en,
                de: landmark.Name.Text_de,
                ja: landmark.Name.Text_ja,
                fr: landmark.Name.Text_fr,
                ingredients
              }
            };
          }, {});
      })
    ).subscribe(landmarks => {
      this.persistToJsonAsset('island-landmarks', landmarks);
      landmarksDone$.next(true);
    });

    combineLatest([
      this.getSheet<any>(xiv, 'MJICraftworksPopularity', null, true, 1),
      this.getSheet<any>(xiv, 'MJICraftworksSupplyDefine', ['Ratio'], true),
      this.getSheet<any>(xiv, 'MJICraftworksObject', ['Item#', 'CraftingTime', 'Value', 'Theme', 'LevelReq']),
      this.getSheet<any>(xiv, 'MJICraftworksRankRatio', ['Ratio'])
    ]).pipe(
      map(([popularity, supplyDefine, craftworksObjects]) => {
        const supplyObj = supplyDefine.reduce((acc, row) => {
          return {
            ...acc,
            [row.index]: row.Ratio
          };
        }, {});

        const popularityMatrix = popularity.reduce((acc, row) => {
          const entry = row.Popularity
            .reduce((eacc, popularity, index) => {
              return {
                ...eacc,
                [index]: {
                  id: popularity.index,
                  ratio: popularity.Ratio
                }
              };
            }, {});
          return {
            ...acc,
            [row.index]: entry
          };
        }, {});

        const craftworksIndex = craftworksObjects.reduce((acc, obj) => {
          return {
            ...acc,
            [obj.index]: {
              itemId: obj.Item,
              value: obj.Value,
              craftingTime: obj.CraftingTime,
              themes: obj.Theme.filter(theme => theme > 0),
              lvl: obj.LevelReq
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

    this.getSheet<any>(xiv, 'MJIItemPouch', ['Item#', 'Crop.Item#'], false, 1).pipe(
      map(itemPouch => {
        return itemPouch
          .filter(row => {
            return row.Crop.Item > 0;
          })
          .reduce((acc, pouch) => {
            return {
              ...acc,
              [pouch.Crop.Item]: {
                seed: pouch.Item
              }
            };
          }, {});
      })
    ).subscribe(cropsData => {
      this.persistToJsonAsset('island-crops', cropsData);
      cropsDone$.next(cropsData);
    });

    combineLatest([
      gatheringDone$,
      buildingsDone$,
      workshopDone$,
      pastureDone$,
      cropsDone$
    ]).subscribe(() => {
      this.done();
    });
  }

  getName(): string {
    return 'island sanctuary';
  }

}
