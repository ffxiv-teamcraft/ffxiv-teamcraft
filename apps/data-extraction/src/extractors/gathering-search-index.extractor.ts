import { AbstractExtractor } from '../abstract-extractor';


export class GatheringSearchIndexExtractor extends AbstractExtractor {

  protected doExtract(): void {
    const nodes = this.requireLazyFile('nodes');
    const fishing = this.requireLazyFile('fishing-spots');
    const reductions = this.requireLazyFile('reduction');

    const index: Record<number, number> = {};

    Object.values<any>(nodes).forEach(node => {
      node.items.forEach(itemId => index[itemId] = node.type);
    });

    Object.values<any>(fishing).forEach(node => {
      node.fishes.forEach(itemId => index[itemId] = 5);
    });

    Object.values<any>(reductions).forEach(itemId => {
      index[itemId] = -1;
    });

    delete index[0];

    this.persistToJsonAsset('gathering-search-index', index);
    this.done();
  }

  getName(): string {
    return 'gathering-search-index';
  }

}
