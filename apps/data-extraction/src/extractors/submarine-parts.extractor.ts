import { AbstractExtractor } from '../abstract-extractor';
import { map, switchMap, tap } from 'rxjs/operators';
import { XivapiEndpoint } from '@xivapi/angular-client';
import { combineLatest } from 'rxjs';

export class SubmarinePartsExtractor extends AbstractExtractor {

  protected doExtract(): any {
    const parts = {};

    this.getAllPages(this.getSearchEndpointWithQuery({
      indexes: XivapiEndpoint.Item,
      columns: 'ID',
      filters: 'FilterGroup=36',
    })).pipe(
      switchMap(res => {
        return combineLatest(res.Results.map(row => {
          return this.get(`https://xivapi.com/Item/${row.ID}`)
        }))
      }),
      map((items) => items.map((item) => {
        return {
          additionalData: item.AdditionalData,
          itemId: item.ID
        };
      })),
      switchMap((itemResults) => {
        return this.get(this.getResourceEndpointWithQuery(XivapiEndpoint.SubmarinePart, {
          ids: itemResults.map((r) => r.additionalData.ID).join(','),
          columns: 'ID,Slot,Rank,Components,Surveillance,Retrieval,Speed,Range,Favor,Class,RepairMaterials'
        }))
          .pipe(
            map((page) => page.Results),
            tap((partResults) => {
              partResults
                .forEach((part) => {
                parts[part.ID] = {
                  id: part.ID,
                  slot: part.Slot,
                  rank: part.Rank,
                  components: part.Components,
                  surveillance: part.Surveillance,
                  retrieval: part.Retrieval,
                  speed: part.Speed,
                  range: part.Range,
                  favor: part.Favor,
                  class: part.Class,
                  repairMaterials: part.RepairMaterials,
                  itemId: itemResults.filter((r) => r.additionalData.ID === part.ID)[0]['itemId']
                };
              });
            })
          );
      })
    ).subscribe(() => {
      this.persistToJsonAsset('submarine-parts', parts);
      this.done();
    });
  }

  getName(): string {
    return 'submarine-parts';
  }

}
