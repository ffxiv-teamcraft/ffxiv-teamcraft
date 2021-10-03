import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { FishingBait } from '../../../core/data/model/fishing-bait';

@Component({
  selector: 'app-fish-tooltip-component',
  templateUrl: './fish-tooltip.component.html',
  styleUrls: ['./fish-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishTooltipComponent {

  @Input() fish: any;

  constructor(private gt: GarlandToolsService, private l12n: LocalizedDataService,
              private lazyData: LazyDataService, private gatheringNodesService: GatheringNodesService) {
  }

  public getFshData(fish: any): GatheringNode[] {
    return this.gatheringNodesService.getItemNodes(fish.ID);
  }

  public trackByNode(index: number, node: GatheringNode): number {
    return node.id;
  }

  public trackByBait(index: number, bait: FishingBait): number {
    return bait.id;
  }
}
