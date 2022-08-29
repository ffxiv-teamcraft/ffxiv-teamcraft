import { AbstractExtractor } from './abstract-extractor';
import { GatheredBy } from '../../model/gathered-by';
import { DataType } from '../data-type';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { GatheringNodesService } from '../../../../core/data/gathering-nodes.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';

export class GatheredByExtractor extends AbstractExtractor<GatheredBy> {

  constructor(private htmlTools: HtmlToolsService, private gatheringNodesService: GatheringNodesService,
              private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.GATHERED_BY;
  }

  protected doExtract(itemId: number): Observable<GatheredBy> {
    return this.gatheringNodesService.getItemNodes(itemId, true).pipe(
      withLazyData(this.lazyData, 'fishParameter', 'gatheringItems'),
      map(([nodes, fishParameter, gatheringItems]) => {
        const nodeType = nodes.length > 0 ? nodes[0].type : -1;
        let gatheringItem: { level: number, stars: number };
        switch (nodeType) {
          case -10:
            gatheringItem = { stars: 0, level: 1 };
            break;
          case -5:
            gatheringItem = fishParameter[itemId];
            break;
          case 4:
            gatheringItem = { stars: 0, level: nodes[0].level };
            break;
          default:
            gatheringItem = Object.values(gatheringItems).find(g => g.itemId === itemId);
            break;
        }
        if (!gatheringItem || nodes.length === 0) {
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
