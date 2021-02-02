import { AbstractExtractor } from '../abstract-extractor';
import { map, switchMap, tap } from 'rxjs/operators';
import { XivapiEndpoint } from '@xivapi/angular-client';

export class AirshipPartsExtractor extends AbstractExtractor {

  protected doExtract(): any {
    const parts = {};

    this.getAllPages(this.getSearchEndpointWithQuery({
      indexes: XivapiEndpoint.Item,
      columns: 'ID,AdditionalData',
      filters: 'FilterGroup=28',
    })).pipe(
      map((page) => page.Results.map((result) => {
        return {
          additionalData: result.AdditionalData,
          itemId: result.ID
        };
      })),
      switchMap((itemResults) => {
        return this.get(this.getResourceEndpointWithQuery(XivapiEndpoint.AirshipExplorationPart, {
          ids: itemResults.map((r) => r.additionalData).join(','),
          columns: 'ID,Slot,Rank,Components,Surveillance,Retrieval,Speed,Range,Favor,RepairMaterials'
        }))
          .pipe(
            map((page) => page.Results),
            tap((partResults) => {
              partResults.forEach((part) => {
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
                  repairMaterials: part.RepairMaterials,
                  itemId: itemResults.filter((r) => r.additionalData === part.ID)[0]['itemId']
                };
              });
            })
          );
      })
    ).subscribe(() => {
      this.persistToJsonAsset('airship-parts', parts);
      this.done();
    });
  }

  getName(): string {
    return 'airship-parts';
  }

}
