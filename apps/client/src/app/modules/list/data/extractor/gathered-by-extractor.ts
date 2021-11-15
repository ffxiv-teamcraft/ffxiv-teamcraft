import { AbstractExtractor } from './abstract-extractor';
import { GatheredBy } from '../../model/gathered-by';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';

export class GatheredByExtractor extends AbstractExtractor<GatheredBy> {

  constructor(protected gt: GarlandToolsService, private htmlTools: HtmlToolsService, private gatheringNodesService: GatheringNodesService,
              private lazyData: LazyDataFacade) {
    super(gt);
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.GATHERED_BY;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<GatheredBy> {
    return this.gatheringNodesService.getItemNodes(item.id, true).pipe(
      withLazyData(this.lazyData, 'fishParameter', 'gatheringItems'),
      map(([nodes, fishParameter, gatheringItems]) => {
        const nodeType = nodes.length > 0 ? nodes[0].type : -1;
        let gatheringItem: { level: number, stars: number };
        switch (nodeType) {
          case -5:
            gatheringItem = fishParameter[item.id];
            break;
          case 4:
            gatheringItem = { stars: 0, level: nodes[0].level };
            break;
          default:
            gatheringItem = Object.values(gatheringItems).find(g => g.itemId === item.id);
            break;
        }
        if (!gatheringItem) {
          return null;
        }
        return {
          stars_tooltip: this.htmlTools.generateStars(gatheringItem.stars || 0),
          level: gatheringItem.level,
          nodes: nodes,
          type: nodes.length > 0 ? nodes[0].type : -1
        };
      })
    );
  }

  protected extractsArray(): boolean {
    return false;
  }

}
