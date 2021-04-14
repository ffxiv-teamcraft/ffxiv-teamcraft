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

  gubalVoyageAggregatorToObject(rows) {
    return rows.reduce((res, row) => {
      return {
        ...res,
        [row.itemId]: [...(res[row.itemId] || []), { type: row.type, id: row.voyageId }]
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
  exploration_per_item(where: {occurences: {_gte: 10}}) {
    itemId
    voyageId
    type
  }
}
`).subscribe(res => {
      this.persistToJsonAsset('desynth', this.gubalToObject(res.data.desynthresults_stats));
      this.persistToJsonAsset('reduction', this.gubalToObject(res.data.reductionresults_stats));
      this.persistToJsonAsset('voyage-sources', this.gubalVoyageAggregatorToObject(res.data.exploration_per_item));
      this.done();
    });
  }

  getName(): string {
    return 'gubal';
  }

}
