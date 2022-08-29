import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest, reduce, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export class IslandExtractor extends AbstractExtractor {

  protected doExtract(): void {
    const gatheringDone$ = new Subject();
    const buildingsDone$ = new Subject();


    this.get('https://xivapi.com/Map/772').pipe(
      switchMap(islandMap => {
        return this.getAllPages('https://xivapi.com/MJIGatheringItem?columns=Item,Radius,X,Y').pipe(
          reduce((mjiGatheringItems, page) => {
            page.Results
              .filter(item => !!item.Item)
              .forEach(item => {
                mjiGatheringItems[item.Item.ID] = {
                  itemId: item.Item.ID,
                  ...this.getCoords({
                    x: item.X,
                    y: item.Y,
                    z: 0
                  }, {
                    size_factor: islandMap.SizeFactor,
                    offset_y: +islandMap.OffsetY,
                    offset_x: +islandMap.OffsetX,
                    offset_z: 0
                  }),
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
      gatheringDone$,
      buildingsDone$
    ]).subscribe(() => {
      this.done();
    });
  }

  getName(): string {
    return 'island sanctuary';
  }

}
