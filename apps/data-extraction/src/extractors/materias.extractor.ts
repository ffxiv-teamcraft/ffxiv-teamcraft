import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class MateriasExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const materiaColumns = [
      'Value',
      'Item#',
      'BaseParam#'
    ];
    const materias = [];
    this.getSheet<any>(xiv, 'Materia', materiaColumns)
      .subscribe(entries => {
        entries
          .filter(entry => entry.Item[0] > 0 && entry.Value[0] > 0)
          .forEach(entry => {
            entry.Item.forEach((itemId, index) => {
              materias.push({
                id: entry.index,
                itemId,
                tier: index + 1,
                value: entry.Value[index],
                baseParamId: entry.BaseParam
              });
            });
            // Object.entries(entry)
            //   .filter(([key, itemId]) => /Item\dTargetID/.test(key) && itemId > 0)
            //   .forEach(([key, itemId]) => {
            //     const index = +/Item(\d)TargetID/.exec(key)[1];
            //     const value = entry[`Value${index}`];
            //     if (value > 0) {
            //       materias.push({
            //         id: entry.ID,
            //         itemId: itemId,
            //         tier: index + 1,
            //         value: entry[`Value${index}`],
            //         baseParamId: entry.BaseParamTargetID
            //       });
            //     }
            //   });
          });
        this.persistToJsonAsset('materias', materias);
        this.done();
      });
  }

  getName(): string {
    return 'materias';
  }

}
