import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CraftingRotationService } from '../../../../core/database/crafting-rotation/crafting-rotation.service';
import {
  Craft,
  CrafterStats,
  CraftingAction,
  SimulationReliabilityReport,
  SimulationResult,
  SimulationService
} from '../../../../core/simulation/simulation.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-community-rotation-finder-popup',
  templateUrl: './community-rotation-finder-popup.component.html',
  styleUrls: ['./community-rotation-finder-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommunityRotationFinderPopupComponent implements OnInit {

  recipe: Craft;

  stats: CrafterStats;

  rotations$: Observable<Array<{
    rotation: CraftingRotation,
    result: SimulationResult,
    reliability: SimulationReliabilityReport,
    actions: CraftingAction[],
    successColor: string,
    qualityColor: string
  }>>;

  constructor(private rotationsService: CraftingRotationService,
              private modalRef: NzModalRef, private simulationService: SimulationService,
              private settings: SettingsService, public translate: TranslateService) {
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  ngOnInit(): void {
    this.rotations$ = this.rotationsService.getCommunityRotations({
      control: this.stats._control,
      craftsmanship: this.stats.craftsmanship,
      cp: this.stats.cp,
      difficulty: this.recipe.progress,
      durability: this.recipe.durability,
      quality: this.recipe.quality,
      rlvl: this.recipe.rlvl,
      tags: [],
      name: ''
    }).pipe(
      map(rotations => {
        return rotations.slice(0, 20)
          .map(rotation => {
            const actions = this.simulator.CraftingActionsRegistry.deserializeRotation(rotation.rotation);
            const simulation = new this.simulator.Simulation(this.recipe, actions, this.stats);
            const result = simulation.run();
            const reliability = simulation.getReliabilityReport();
            return {
              rotation,
              result,
              reliability,
              actions,
              successColor: this.getReliabilityColor(reliability.successPercent),
              qualityColor: this.getReliabilityColor(reliability.averageHQPercent)
            };
          })
          .sort((a, b) => {
            return (b.reliability.averageHQPercent * b.reliability.successPercent)
              - (a.reliability.averageHQPercent * a.reliability.successPercent);
          })
          .slice(0, 3);
      })
    );
  }

  select(rotation: CraftingAction[]): void {
    this.modalRef.close(rotation);
  }

  private getReliabilityColor(percent: number): string {
    if (percent >= 85) {
      return 'darkgreen';
    } else if (percent >= 50) {
      return '#f2b10e';
    }
    return '#f50';
  }
}
