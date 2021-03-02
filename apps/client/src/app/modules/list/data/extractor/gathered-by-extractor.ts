import { AbstractExtractor } from './abstract-extractor';
import { GatheredBy } from '../../model/gathered-by';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class GatheredByExtractor extends AbstractExtractor<GatheredBy> {

  constructor(protected gt: GarlandToolsService, private htmlTools: HtmlToolsService, private gatheringNodesService: GatheringNodesService,
              private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.GATHERED_BY;
  }

  protected canExtract(item: Item): boolean {
    return item.hasNodes() || (item.fishingSpots !== undefined && item.fishingSpots.length > 0);
  }

  protected doExtract(item: Item, itemData: ItemData): GatheredBy {
    const nodes = this.gatheringNodesService.getItemNodes(item.id, true);
    const nodeType = nodes.length > 0 ? nodes[0].type : -1;
    let gatheringItem: { level: number, stars: number };
    switch (nodeType) {
      case -5:
        gatheringItem = this.lazyData.data.fishParameter[item.id];
        break;
      case 4:
        gatheringItem = this.lazyData.data.spearFishingNodes.find(s => s.itemId === item.id);
        break;
      default:
        gatheringItem = Object.values<any>(this.lazyData.data.gatheringItems).find(g => g.itemId === item.id);
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
  }

  protected extractsArray(): boolean {
    return false;
  }

}
