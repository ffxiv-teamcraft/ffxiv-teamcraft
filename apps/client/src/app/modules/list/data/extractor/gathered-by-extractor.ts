import { AbstractExtractor } from './abstract-extractor';
import { GatheredBy } from '../../model/gathered-by';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';
import { gatheringItems } from '../../../../core/data/sources/gathering-items';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';

export class GatheredByExtractor extends AbstractExtractor<GatheredBy> {

  constructor(protected gt: GarlandToolsService, private htmlTools: HtmlToolsService, private gatheringNodesService: GatheringNodesService) {
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
    const gatheringItem = Object.keys(gatheringItems).map(key => gatheringItems[key]).find(g => g.itemId === item.id);
    return {
      icon: '',
      stars_tooltip: gatheringItem ? this.htmlTools.generateStars(gatheringItem.stars) : '',
      level: gatheringItem ? gatheringItem.level : 999,
      nodes: this.gatheringNodesService.getItemNodes(item.id, true),
      type: -1
    };
  }

  protected extractsArray(): boolean {
    return false;
  }

}
