import { AbstractExtractor } from '../abstract-extractor';
import { map, switchMap, tap } from 'rxjs/operators';
import { XivapiEndpoint } from '@xivapi/angular-client';

export class SubmarinePartsExtractor extends AbstractExtractor {

  protected doExtract(): any {
    const parts = {};

    this.getAllPages(`${this.getSearchEndpointWithQuery({
      indexes: XivapiEndpoint.Item,
      columns: 'ID,Name_*,ItemUICategory.ID,AdditionalData',
      string_column: 'FilterGroup',
      string: '36',
      string_algo: 'match',
    })}`).pipe(
      map((page) => page.Results.map((result) => {
        return {
          AdditionalData: result.AdditionalData,
          ItemID: result.ID
        };
      })),
      switchMap((itemResults) => {
        return this.get(this.getResourceEndpointWithQuery(XivapiEndpoint.SubmarinePart, {
          ids: itemResults.map((r) => r.AdditionalData).join(','),
          columns: 'ID,Components,Favor,Range,Rank,RepairMaterials,Retrieval,Slot,Speed,Surveillance'
        }))
          .pipe(
            map((page) => page.Results),
            tap((partResults) => {
              partResults.forEach((part) => {
                parts[part.ID] = {
                  ...part,
                  ItemID: itemResults.filter((r) => r.AdditionalData === part.ID)[0]['ItemID']
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
