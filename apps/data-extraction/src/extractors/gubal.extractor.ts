import { AbstractExtractor } from '../abstract-extractor';

export class GubalExtractor extends AbstractExtractor {
  gubalToObject(rows) {
    return rows.reduce((res, row) => {
      if (row.itemId < 500 || row.resultItemId < 500 || row.resultItemId > 100000 || row.itemId > 100000) {
        return res;
      }
      return {
        ...res,
        [row.resultItemId]: [...(res[row.resultItemId] || []), row.itemId]
      };
    }, {});
  }

  gubalToReverseObject(rows) {
    return rows.reduce((res, row) => {
      if (row.itemId < 500 || row.resultItemId < 500 || row.resultItemId > 100000 || row.itemId > 100000) {
        return res;
      }
      return {
        ...res,
        [row.itemId]: [...(res[row.itemId] || []), row.resultItemId]
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
  exploration_per_item(where: {occurences: {_gte: 10}}) {
    itemId
    voyageId
    type
  }
  bnpc {
    bnpcBase
    bnpcName
  }
}
`).subscribe(res => {
      this.persistToJsonAsset('voyage-sources', this.gubalVoyageAggregatorToObject(res.data.exploration_per_item));
      this.persistToJsonAsset('gubal-bnpcs-index', res.data.bnpc.reduce((acc, row) => ({ ...acc, [row.bnpcBase]: row.bnpcName }), {}));
      this.done();
    });
  }

  getName(): string {
    return 'gubal';
  }

}
