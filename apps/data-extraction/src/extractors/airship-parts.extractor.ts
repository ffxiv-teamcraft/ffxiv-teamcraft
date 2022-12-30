import { AbstractExtractor } from '../abstract-extractor';
import { map } from 'rxjs/operators';
import { XivDataService } from '../xiv/xiv-data.service';

export class AirshipPartsExtractor extends AbstractExtractor {

  protected doExtract(xiv: XivDataService): any {
    const parts = {};

    this.getSheet<any>(xiv, 'Item', ['FilterGroup#',
      'AdditionalData.Slot', 'AdditionalData.Rank', 'AdditionalData.Components', 'AdditionalData.Surveillance', 'AdditionalData.Retrieval', 'AdditionalData.Speed', 'AdditionalData.Range', 'AdditionalData.Favor', 'AdditionalData.Class', 'AdditionalData.RepairMaterials'], false, 1).pipe(
      map(items => items.filter(i => i.FilterGroup === 28))
    ).subscribe(items => {
      items.forEach(item => {
        const part = item.AdditionalData;
        parts[part.index] = {
          id: part.index,
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
          itemId: item.index
        };
      });
      this.persistToJsonAsset('airship-parts', parts);
      this.done();
    });
  }

  getName(): string {
    return 'airship-parts';
  }

}
