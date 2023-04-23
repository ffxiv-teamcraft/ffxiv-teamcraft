import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { FishingBait, GatheringNode } from '@ffxiv-teamcraft/types';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { observeInput } from '../../../core/rxjs/observe-input';

@Component({
  selector: 'app-fish-tooltip-component',
  templateUrl: './fish-tooltip.component.html',
  styleUrls: ['./fish-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishTooltipComponent {

  @Input()
  fish: { ID: number, Description: string, ItemKind: number, Icon: string };

  public fshData$: Observable<GatheringNode[]> = observeInput(this, 'fish').pipe(
    switchMap(fish => {
      return this.gatheringNodesService.getItemNodes(fish.ID);
    })
  );

  public minGathering$: Observable<number> = this.fshData$.pipe(
    map(data => {
      return data
        .map(node => {
          return node.minGathering;
        })
        .sort((a, b) => a - b)[0];
    })
  );

  constructor(private gatheringNodesService: GatheringNodesService) {
  }

  public trackByNode(index: number, node: GatheringNode): number {
    return node.id;
  }

  public trackByBait(index: number, bait: FishingBait): number {
    return bait.id;
  }
}
