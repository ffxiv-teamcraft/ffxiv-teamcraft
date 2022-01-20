import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { FishingBait } from '../../../core/data/model/fishing-bait';
import { Observable } from 'rxjs';
import { FishDataService } from '../../../pages/db/service/fish-data.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fish-tooltip-component',
  templateUrl: './fish-tooltip.component.html',
  styleUrls: ['./fish-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishTooltipComponent {

  public fshData$: Observable<GatheringNode[]>;

  public minGathering$: Observable<number>;

  constructor(private gatheringNodesService: GatheringNodesService,
              private fishData: FishDataService) {
  }

  private _fish: any;

  get fish(): any {
    return this._fish;
  }

  @Input()
  set fish(fish: any) {
    this._fish = fish;
    this.fshData$ = this.gatheringNodesService.getItemNodes(fish.ID);
    this.minGathering$ = this.fishData.getStatisticsByFishId(fish.ID).pipe(
      map(res => {
        return res.data.stats.aggregate.min.gathering;
      })
    );
  }

  public trackByNode(index: number, node: GatheringNode): number {
    return node.id;
  }

  public trackByBait(index: number, bait: FishingBait): number {
    return bait.id;
  }
}
