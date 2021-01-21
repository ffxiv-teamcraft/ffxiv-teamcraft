import { AbstractExtractor } from '../abstract-extractor';

export class MateriasExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const materiaColumns = [
      'ID',
      'Value0',
      'Value1',
      'Value2',
      'Value3',
      'Value4',
      'Value5',
      'Value6',
      'Value7',
      'Value8',
      'Value9',
      'Item0TargetID',
      'Item1TargetID',
      'Item2TargetID',
      'Item3TargetID',
      'Item4TargetID',
      'Item5TargetID',
      'Item6TargetID',
      'Item7TargetID',
      'Item8TargetID',
      'Item9TargetID',
      'BaseParamTargetID'
    ];
    const materias = [];
    this.getAllPages(`https://xivapi.com/Materia?columns=${materiaColumns.join(',')}`).subscribe(page => {
      page.Results
        .filter(entry => entry.Item0 !== null && entry.Value0 > 0)
        .forEach(entry => {
          Object.entries(entry)
            .filter(([key, itemId]) => /Item\dTargetID/.test(key) && itemId > 0)
            .forEach(([key, itemId]) => {
              const index = +/Item(\d)TargetID/.exec(key)[1];
              const value = entry[`Value${index}`];
              if (value > 0) {
                materias.push({
                  id: entry.ID,
                  itemId: itemId,
                  tier: index + 1,
                  value: entry[`Value${index}`],
                  baseParamId: entry.BaseParamTargetID
                });
              }
            });
        });
    }, null, () => {
      this.persistToJsonAsset('materias', materias);
      this.done();
    });
  }

  getName(): string {
    return 'materias';
  }

}
