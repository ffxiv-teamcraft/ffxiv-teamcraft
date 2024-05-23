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
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { ConsumablesService } from '../../model/consumables.service';
import { PageLoaderComponent } from '../../../../modules/page-loader/page-loader/page-loader.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { ActionComponent } from '../action/action.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UserAvatarComponent } from '../../../../modules/user-avatar/user-avatar/user-avatar.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';
import { DialogComponent } from '../../../../core/dialog.component';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';

@Component({
  selector: 'app-community-rotation-finder-popup',
  templateUrl: './community-rotation-finder-popup.component.html',
  styleUrls: ['./community-rotation-finder-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NzCardModule, FlexModule, NzCheckboxModule, FormsModule, NzEmptyModule, NzDividerModule, UserAvatarComponent, NzButtonModule, NzIconModule, NzToolTipModule, NzTagModule, ActionComponent, NzWaveModule, PageLoaderComponent, AsyncPipe, TranslateModule, ItemIconComponent, I18nNameComponent]
})
export class CommunityRotationFinderPopupComponent extends DialogComponent implements OnInit {

  recipe: Craft;

  stats: CrafterStats;

  rotations$: Observable<{
    rotation: CraftingRotation,
    result: SimulationResult,
    reliability: SimulationReliabilityReport,
    actions: CraftingAction[],
    successColor: string,
    qualityColor: string
  }[]>;

  amountToShow$ = new BehaviorSubject(3);

  showRotationsAboveStats$ = new BehaviorSubject(false);

  constructor(private rotationsService: CraftingRotationService,
              private modalRef: NzModalRef, private simulationService: SimulationService,
              private settings: SettingsService, public translate: TranslateService,
              private lazyData: LazyDataFacade, public consumablesService: ConsumablesService) {
    super();
  }

  private get simulator() {
    return this.simulationService.getSimulator(this.settings.region);
  }

  ngOnInit(): void {
    this.patchData();
    this.rotations$ = combineLatest([
      this.amountToShow$,
      this.showRotationsAboveStats$
    ]).pipe(
      switchMap(([amount, showAbove]) => {
        return this.rotationsService.getCommunityRotations({
          control: this.stats._control + (showAbove ? 100 : 0),
          craftsmanship: this.stats.craftsmanship + (showAbove ? 100 : 0),
          cp: this.stats.cp + (showAbove ? 20 : 0),
          difficulty: this.recipe.progress,
          durability: this.recipe.durability,
          quality: this.recipe.quality,
          rlvl: this.recipe.rlvl,
          tags: [],
          name: ''
        }).pipe(
          first(),
          withLazyData(this.lazyData, 'foods', 'medicines'),
          map(([rotations, lazyFoods, lazyMedicines]) => {
            const foods = this.consumablesService.fromLazyData(lazyFoods);
            const medicines = this.consumablesService.fromLazyData(lazyMedicines);
            return rotations
              .slice(0, 40)
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
                  this.stats.splendorous,
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
                if (a.reliability.successPercent === b.reliability.successPercent) {
                  return b.reliability.averageHQPercent - a.reliability.averageHQPercent;
                }
                return b.reliability.successPercent - a.reliability.successPercent;
              })
              .slice(0, amount);
          })
        );
      })
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
