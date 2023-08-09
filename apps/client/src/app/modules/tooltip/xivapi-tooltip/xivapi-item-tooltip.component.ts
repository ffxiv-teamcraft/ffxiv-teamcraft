import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LazyItemsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-items-database-page';
import { BaseParam, DataType, ExplorationType, ExtractRow, FishingBait, GatheringNode, getItemSource } from '@ffxiv-teamcraft/types';
import { Observable } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-xivdb-tooltip-component',
  templateUrl: './xivapi-item-tooltip.component.html',
  styleUrls: ['./xivapi-item-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

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
