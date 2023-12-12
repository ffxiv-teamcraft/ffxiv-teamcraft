import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { GatheringNodesService } from '../../../core/data/gathering-nodes.service';
import { GatheringNode } from '@ffxiv-teamcraft/types';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../page-loader/page-loader/page-loader.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FishingBaitComponent } from '../../fishing-bait/fishing-bait/fishing-bait.component';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { NodeDetailsComponent } from '../../node-details/node-details/node-details.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-reduced-from',
    templateUrl: './reduced-from.component.html',
    styleUrls: ['./reduced-from.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, NgFor, NzCardModule, ItemRarityDirective, ItemIconComponent, NzListModule, NodeDetailsComponent, MapPositionComponent, FishingBaitComponent, NzToolTipModule, NzButtonModule, NzWaveModule, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, NodeTypeIconPipe, ClosestAetherytePipe, LazyIconPipe]
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
