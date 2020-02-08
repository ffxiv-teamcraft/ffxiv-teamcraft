import { Component } from '@angular/core';
import { Simulation } from '@ffxiv-teamcraft/simulator';
import { CraftingRotation } from 'apps/client/src/app/model/other/crafting-rotation';
import { LinkToolsService } from '../../../../core/tools/link-tools.service';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-simulation-share-popup',
  templateUrl: './simulation-share-popup.component.html',
  styleUrls: ['./simulation-share-popup.component.less']
})
export class SimulationSharePopupComponent {

  simulation: Simulation;

  rotation: CraftingRotation;

  includeStats: boolean;

  constructor(private linkTools: LinkToolsService, private message: NzMessageService,
              private translate: TranslateService, private modalRef: NzModalRef) {
  }

  getLink(): string {
    let baseLink: string;
    if (this.rotation.custom) {
      baseLink = this.linkTools.getLink(`/simulator/custom/${this.rotation.$key}`);
    } else {
      baseLink = this.linkTools.getLink(`/simulator/${this.rotation.defaultItemId}/${this.rotation.defaultRecipeId}/${this.rotation.$key}`);
    }
    if (this.includeStats) {
      return `${baseLink}?stats=${
        this.simulation.crafterStats.craftsmanship}/${
        this.simulation.crafterStats._control}/${
        this.simulation.crafterStats.cp}/${
        this.simulation.crafterStats.level}/${
        this.simulation.crafterStats.specialist ? '1' : '0'}`;
    }
    return baseLink;
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('SIMULATOR.Share_link_copied'));
    this.modalRef.close();
  }

}
