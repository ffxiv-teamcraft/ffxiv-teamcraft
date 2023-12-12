import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LazyItemsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-items-database-page';
import { BaseParam, DataType, ExplorationType, ExtractRow, FishingBait, GatheringNode, getItemSource } from '@ffxiv-teamcraft/types';
import { Observable } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { filter, map } from 'rxjs/operators';
import { uniqBy } from 'lodash';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { HooksetActionIdPipe } from '../../../pipes/pipes/hookset-action-id.pipe';
import { TugNamePipe } from '../../../pipes/pipes/tug-name.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NodeDetailsComponent } from '../../node-details/node-details/node-details.component';
import { MapComponent } from '../../map/map/map.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, AsyncPipe } from '@angular/common';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-item-tooltip-component',
    templateUrl: './xivapi-item-tooltip.component.html',
    styleUrls: ['./xivapi-item-tooltip.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzGridModule, FlexModule, ItemRarityDirective, NgIf, I18nNameComponent, NgFor, NzToolTipModule, NzButtonModule, NzIconModule, NgSwitch, NgSwitchCase, MapComponent, NodeDetailsComponent, AsyncPipe, TranslateModule, ItemNamePipe, ActionIconPipe, NodeTypeIconPipe, ClosestAetherytePipe, XivapiIconPipe, LazyIconPipe, MapNamePipe, JobUnicodePipe, TugNamePipe, HooksetActionIdPipe, LazyRowPipe, I18nPipe, I18nRowPipe, NzPipesModule]
})
export class XivapiItemTooltipComponent implements OnInit {

  DataType = DataType;

  ExplorationType = ExplorationType;

  DOWM = { 'en': 'Disciple of War/Magic', 'ja': '戦闘職', 'de': 'Krieger/Magier', 'fr': 'Combattant' };

  @Input() item: LazyItemsDatabasePage & ExtractRow;

  public fshData$: Observable<GatheringNode[]> = observeInput(this, 'item').pipe(
    filter(item => item.sources.some(s => s.type === DataType.GATHERED_BY)),
    map(item => {
      return getItemSource(item, DataType.GATHERED_BY);
    }),
    filter(gatheredBy => gatheredBy?.type === -5),
    map(gatheredBy => gatheredBy.nodes)
  );

  public globalFshInfo$ = this.fshData$.pipe(
    map(data => {
      return data.find(d => d.hookset !== undefined && d.tug !== undefined);
    })
  );

  public baits$ = this.fshData$.pipe(
    map(data => {
      return uniqBy(data, node => node.baits.map(bait => bait.id).join(';'))
        .map(node => node.baits);
    })
  );

  public predators$ = this.fshData$.pipe(
    map(data => {
      return data.find(node => node.predators?.length > 0)?.predators;
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

  /**
   * Main attributes are ilvl, attack damage or duration for foods.
   */
  public mainAttributes = [];

  public trackByNode(index: number, node: GatheringNode): number {
    return node.id;
  }

  public trackByBait(index: number, bait: FishingBait): number {
    return bait.id;
  }

  ngOnInit(): void {
    if (this.item === undefined) {
      return;
    }
    // If the item has some damage, handle it.
    if (this.item.pDmg || this.item.mDmg) {
      if (this.item.pDmg > this.item.mDmg) {
        this.mainAttributes.push({
          ID: BaseParam.PHYSICAL_DAMAGE,
          NQ: this.item.pDmg,
          HQ: this.item.pDmg + this.item.bpSpecial[0]
        });
      } else {
        this.mainAttributes.push({
          ID: BaseParam.MAGIC_DAMAGE,
          NQ: this.item.mDmg,
          HQ: this.item.mDmg + this.item.bpSpecial[1]
        });
      }
    }
    // If the item has some defense, handle it.
    if (this.item.pDef || this.item.mDef) {
      this.mainAttributes.push({
        ID: BaseParam.DEFENSE,
        NQ: this.item.pDef,
        HQ: this.item.pDef + this.item.bpSpecial[0]
      });
      this.mainAttributes.push({
        ID: BaseParam.MAGIC_DEFENSE,
        NQ: this.item.mDef,
        HQ: this.item.mDef + this.item.bpSpecial[1]
      });
    }
  }


}
