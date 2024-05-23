import { Component, OnInit } from '@angular/core';
import { MuscleMemory, Simulation } from '@ffxiv-teamcraft/simulator';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { RotationTag } from '../community-rotations-page/rotation-tag';
import { CommunityRotationsPageComponent } from '../community-rotations-page/community-rotations-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { MouseWheelDirective } from '../../../../core/event/mouse-wheel/mouse-wheel.directive';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FlexModule } from '@angular/flex-layout/flex';
import { DialogComponent } from '../../../../core/dialog.component';

@Component({
  selector: 'app-community-rotation-popup',
  templateUrl: './community-rotation-popup.component.html',
  styleUrls: ['./community-rotation-popup.component.less'],
  standalone: true,
  imports: [FlexModule, NzSwitchModule, FormsModule, NzFormModule, NzGridModule, NzSelectModule, NzInputNumberModule, MouseWheelDirective, TranslateModule]
})
export class CommunityRotationPopupComponent extends DialogComponent implements OnInit {

  public rotation: CraftingRotation;

  public simulation: Simulation;

  public bonuses: any;

  public tags: any[];

  public rlvls = CommunityRotationsPageComponent.RLVLS;

  constructor() {
    super();
    this.tags = Object.keys(RotationTag).map(key => {
      return {
        value: key,
        label: `SIMULATOR.COMMUNITY_ROTATIONS.TAGS.${key}`
      };
    });
  }

  ngOnInit(): void {
    this.patchData();
    const minStats = this.simulation.getMinStats();
    let rlvl = this.rotation.recipe.rlvl;
    if (rlvl >= 120 && rlvl <= 150) {
      rlvl = 150;
    }
    if (rlvl >= 260 && rlvl <= 290) {
      rlvl = 290;
    }
    if (rlvl >= 390 && rlvl <= 420) {
      rlvl = 420;
    }
    if (rlvl < 50) {
      rlvl = Math.floor(rlvl / 10) * 10;
    }
    this.rotation.community = this.rotation.community || {
      rlvl: rlvl,
      durability: this.rotation.recipe.durability,
      minControl: minStats.control - this.bonuses.control,
      minCraftsmanship: minStats.craftsmanship - this.bonuses.craftsmanship,
      minCp: Math.max(minStats.cp - this.bonuses.cp, 180)
    };
    if (this.rotation.tags.length === 0) {
      const actions = this.simulation.steps.map(step => step.action);
      if (actions.some(action => action.is(MuscleMemory)) && this.rotation.tags.indexOf('MUSCLE_MEMORY') === -1) {
        this.rotation.tags.push('MUSCLE_MEMORY');
      }
    }
  }

  public adjust(prop: string, amount: number, min: number): void {
    this.rotation.community[prop] = Math.max(this.rotation.community[prop] + amount, min);
  }
}
