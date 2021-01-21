import { AbstractExtractor } from '../abstract-extractor';

export class GubalExtractor extends AbstractExtractor {
  gubalToObject(rows) {
    return rows.reduce((res, row) => {
      return {
        ...res,
        [row.resultItemId]: [...(res[row.resultItemId] || []), row.itemId]
      };
    }, {});
  }

  protected doExtract(): any {
    this.gubalRequest(`query desynthAndReductionStats {
  desynthresults_stats(where: {occurences: {_gte: 10}}) {
    itemId
    resultItemId
  }
  reductionresults_stats(where: {occurences: {_gte: 10}}) {
    itemId
    resultItemId
  }
}
`).subscribe(res => {
      this.persistToJsonAsset('desynth', this.gubalToObject(res.data.desynthresults_stats));
      this.persistToJsonAsset('reduction', this.gubalToObject(res.data.reductionresults_stats));
      this.done();
    });
  }

  getName(): string {
    return 'gubal';
  }

}
