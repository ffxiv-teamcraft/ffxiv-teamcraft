import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';

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
}
