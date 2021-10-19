import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { FishingBait } from '../../../core/data/model/fishing-bait';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-fish-tooltip-component',
  templateUrl: './fish-tooltip.component.html',
  styleUrls: ['./fish-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishTooltipComponent {

  private _fish: any;

  public fshData$: Observable<GatheringNode[]>;

  @Input()
  set fish(fish: any) {
    this._fish = fish;
    this.fshData$ = this.gatheringNodesService.getItemNodes(fish.ID);
  }

  get fish(): any {
    return this._fish;
  }

  constructor(private gt: GarlandToolsService, private l12n: LocalizedDataService,
              private gatheringNodesService: GatheringNodesService) {
  }

  public trackByNode(index: number, node: GatheringNode): number {
    return node.id;
  }

  public trackByBait(index: number, bait: FishingBait): number {
    return bait.id;
  }
}
