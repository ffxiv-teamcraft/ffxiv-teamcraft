import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CraftingRotationService } from '../../../../core/database/crafting-rotation/crafting-rotation.service';
import {
  Craft,
  CrafterLevels,
  CrafterStats,
  CraftingAction,
  SimulationReliabilityReport,
  SimulationResult,
  SimulationService
} from '../../../../core/simulation/simulation.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { ConsumablesService } from '../../model/consumables.service';

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
              private settings: SettingsService, public translate: TranslateService,
              private lazyData: LazyDataFacade, public consumablesService: ConsumablesService) {
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
      withLazyData(this.lazyData, 'foods', 'medicines'),
      map(([rotations, lazyFoods, lazyMedicines]) => {
        const foods = this.consumablesService.fromLazyData(lazyFoods);
        const medicines = this.consumablesService.fromLazyData(lazyMedicines);
        return rotations.slice(0, 40)
          .map(rotation => {
            let food = null;
            let medicine = null;
            if (rotation.food) {
              food = foods.find(f => f.itemId === rotation.food.id && f.hq === rotation.food.hq);
            }
            if (rotation.medicine) {
              medicine = medicines.find(m => m.itemId === rotation.medicine.id && m.hq === rotation.medicine.hq);
            }
            const bonuses = {
              craftsmanship: this.consumablesService.getBonusValue('Craftsmanship', this.stats.craftsmanship, food, medicine, []),
              control: this.consumablesService.getBonusValue('Control', this.stats._control, food, medicine, []),
              cp: this.consumablesService.getBonusValue('CP', this.stats.cp, food, medicine, [])
            };
            const statsWithConsumables = new this.simulator.CrafterStats(
              this.stats.jobId,
              this.stats.craftsmanship + bonuses.craftsmanship,
              this.stats._control + bonuses.control,
              this.stats.cp + bonuses.cp,
              this.stats.specialist,
              this.stats.level,
              this.stats.levels as CrafterLevels);
            const actions = this.simulator.CraftingActionsRegistry.deserializeRotation(rotation.rotation);
            const simulation = new this.simulator.Simulation(this.recipe, actions, statsWithConsumables);
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
            if(a.reliability.successPercent === b.reliability.successPercent){
              return b.reliability.averageHQPercent - a.reliability.averageHQPercent;
            }
            return b.reliability.successPercent - a.reliability.successPercent;
          })
          .slice(0, 3);
      }),
      first()
    );
  }

  select(rotation: CraftingRotation): void {
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
