import { Component } from '@angular/core';
import { CrafterStats } from '@ffxiv-teamcraft/simulator';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { Consumable } from '../../model/consumable';
import { FreeCompanyAction } from '../../model/free-company-action';

@Component({
  selector: 'app-simulation-share-popup',
  templateUrl: './simulation-share-popup.component.html',
  styleUrls: ['./simulation-share-popup.component.less']
})
export class SimulationSharePopupComponent {

  rotation: CraftingRotation;

  stats: CrafterStats;

  includeStats: boolean;

  food: Consumable;

  medicine: Consumable;

  freeCompanyActions: FreeCompanyAction[];

  constructor(private linkTools: LinkToolsService, private message: NzMessageService,
              private translate: TranslateService, private modalRef: NzModalRef) {
  }

  getStatsParam(): string[] {
    return [
      String(this.stats.craftsmanship),
      String(this.stats._control),
      String(this.stats.cp),
      String(this.stats.level),
      this.stats.specialist ? '1' : '0'
    ];
  }

  getLink = () => {
    let baseLink: string;
    if (this.rotation.custom) {
      baseLink = this.linkTools.getLink(`/simulator/custom/${this.rotation.$key}`);
    } else {
      baseLink = this.linkTools.getLink(`/simulator/${this.rotation.defaultItemId}/${this.rotation.defaultRecipeId}/${this.rotation.$key}`);
    }

    if (this.includeStats) {
      const makePair = (item: Consumable) => `${item.itemId},${item.hq ? 1 : 0}`;

      const params = [
        `stats=${this.getStatsParam().join('/')}`
      ];

      if (this.food) {
        params.push(`food=${makePair(this.food)}`);
      }

      if (this.medicine) {
        params.push(`med=${makePair(this.medicine)}`);
      }

      if (this.freeCompanyActions && this.freeCompanyActions.length > 0) {
        params.push(`fca=${this.freeCompanyActions.map(fca => fca.actionId).join(',')}`);
      }

      baseLink += '?' + params.join('&');
    }

    return baseLink;
  };

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('SIMULATOR.Share_link_copied'));
    this.modalRef.close();
  }

}
