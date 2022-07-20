import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '../../../core/data/model/gathering-node';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'app-reduced-from',
  templateUrl: './reduced-from.component.html',
  styleUrls: ['./reduced-from.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReducedFromComponent extends ItemDetailsPopup<number[]> implements OnInit {

  showEverything$ = new BehaviorSubject(false);

  nodes$: Observable<Record<number, { node: GatheringNode }[]>>;

  detailsDisplay$ = this.showEverything$.pipe(
    map(showEverything => {
      if (showEverything) {
        return {
          data: this.details,
          hasMore: false
        };
      }
      return {
        data: this.details.slice(0, 5),
        hasMore: this.details.length > 5
      };
    })
  );

  constructor(private gatheringNodesService: GatheringNodesService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.nodes$ = combineLatest(this.details.map(reduction => {
      return this.gatheringNodesService.getItemNodes(reduction).pipe(
        map(nodes => {
          return nodes.map(node => {
            return {
              reduction,
              node
            };
          });
        })
      );
    })).pipe(
      map(rows => {
        return rows.flat().reduce((acc, { reduction, ...details }) => {
          return {
            ...acc,
            [reduction]: [...(acc[reduction] || []), details]
          };
        }, {});
      })
    );
  }

}
